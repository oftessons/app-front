import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import katex from 'katex';

@Directive({
  selector: 'markdown[katex-render]'
})
export class KatexRenderDirective implements AfterViewInit, OnDestroy {
  private observer: MutationObserver | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.renderKatex();
    this.setupMutationObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupMutationObserver(): void {
    
    if (this.observer) {
      return;
    }
    
    this.observer = new MutationObserver((mutations) => {
      
      const element = this.el.nativeElement;
      if (element.hasAttribute('data-katex-processed')) {
        return;
      }
      
      
      const hasTextChanges = mutations.some(mutation => 
        mutation.type === 'characterData' || 
        (mutation.type === 'childList' && 
         Array.from(mutation.addedNodes).some(node => node.nodeType === Node.TEXT_NODE))
      );
      
      if (hasTextChanges) {
        this.renderKatex();
      }
    });

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private renderKatex(): void {
    const element = this.el.nativeElement;
    
    if (element.hasAttribute('data-katex-processed')) {
      return;
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }

    setTimeout(() => {
      
      this.cleanDuplicates(element);
      
      this.processBlockMath(element);
      
      this.processInlineMath(element);
      
      this.processTableMath(element);
      
      element.setAttribute('data-katex-processed', 'true');
      
      this.setupMutationObserver();
    }, 50);
  }

  private cleanDuplicates(element: HTMLElement): void {
    
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToClean: Node[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      const nextSibling = node.nextSibling;
      
      
      if (nextSibling && 
          nextSibling.nodeType === Node.ELEMENT_NODE &&
          (nextSibling as Element).querySelector('.katex')) {
        
        
        const incompleteFormulaMatch = text.match(/\$[^$]*$/);
        if (incompleteFormulaMatch) {
          nodesToClean.push(node);
        }
      }
    }

    
    nodesToClean.forEach(node => {
      const text = node.textContent || '';
      const cleanedText = text.replace(/\$[^$]*$/, '');
      
      if (cleanedText) {
        node.textContent = cleanedText;
      } else {
        node.parentNode?.removeChild(node);
      }
    });
  }

  private processBlockMath(element: HTMLElement): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          
          const parent = node.parentElement;
          if (parent?.classList.contains('katex') || 
              parent?.classList.contains('katex-mathml') ||
              parent?.tagName === 'TABLE' ||
              parent?.tagName === 'TD' ||
              parent?.tagName === 'TH' ||
              parent?.closest('table')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToReplace: { node: Node; matches: RegExpMatchArray[] }[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      const blockMathRegex = /\$\$([\s\S]+?)\$\$/g;
      const matches: RegExpMatchArray[] = [];
      let match: RegExpMatchArray | null;
      
      while ((match = blockMathRegex.exec(text)) !== null) {
        matches.push(match);
      }
      
      if (matches.length > 0) {
        nodesToReplace.push({ node, matches });
      }
    }

    nodesToReplace.forEach(({ node, matches }) => {
      let text = node.textContent || '';
      let offset = 0;
      const parent = node.parentNode;
      
      if (!parent) return;

      matches.forEach((match) => {
        const fullMatch = match[0];
        const latex = match[1];
        const index = match.index! + offset;

        
        if (index > 0) {
          const beforeText = text.substring(0, index);
          if (beforeText) {
            parent.insertBefore(document.createTextNode(beforeText), node);
          }
        }

        
        const span = document.createElement('span');
        span.style.display = 'block';
        span.style.margin = '10px 0';
        span.style.textAlign = 'center';
        
        try {
          katex.render(latex, span, {
            displayMode: true,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false
          });
        } catch (error) {
          console.error('Erro ao renderizar KaTeX (bloco):', error);
          span.textContent = fullMatch;
        }
        
        parent.insertBefore(span, node);

        
        text = text.substring(index + fullMatch.length);
        offset = 0;
      });

      
      if (text) {
        parent.insertBefore(document.createTextNode(text), node);
      }

      parent.removeChild(node);
    });
  }

  private processInlineMath(element: HTMLElement): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          
          const parent = node.parentElement;
          if (parent?.classList.contains('katex') || 
              parent?.classList.contains('katex-mathml') ||
              parent?.tagName === 'CODE' ||
              parent?.tagName === 'PRE' ||
              parent?.tagName === 'TABLE' ||
              parent?.tagName === 'TD' ||
              parent?.tagName === 'TH' ||
              parent?.closest('table')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToReplace: { node: Node; matches: RegExpMatchArray[] }[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      
      
      if (!text.trim()) continue;
      
      const nextSibling = node.nextSibling;
      const prevSibling = node.previousSibling;
      
      
      if ((nextSibling && (nextSibling as Element).querySelector?.('.katex')) ||
          (prevSibling && (prevSibling as Element).querySelector?.('.katex'))) {
        continue;
      }
      
      
      
      const inlineMathRegex = /\$([^\$]+?)\$/g;
      const matches: RegExpMatchArray[] = [];
      let match: RegExpMatchArray | null;
      
      
      inlineMathRegex.lastIndex = 0;
      
      while ((match = inlineMathRegex.exec(text)) !== null) {
        
        if (match.index !== undefined) {
          const prevChar = text[match.index - 1];
          const nextChar = text[match.index + match[0].length];
          
          
          if (prevChar === '$' || nextChar === '$') {
            continue;
          }
        }
        
        matches.push(match);
      }
      
      if (matches.length > 0) {
        nodesToReplace.push({ node, matches });
      }
    }

    nodesToReplace.forEach(({ node, matches }) => {
      let text = node.textContent || '';
      let offset = 0;
      const parent = node.parentNode;
      
      if (!parent) return;

      matches.forEach((match) => {
        const fullMatch = match[0];
        const latex = match[1];
        const index = match.index! + offset;

        
        if (index > 0) {
          const beforeText = text.substring(0, index);
          if (beforeText) {
            parent.insertBefore(document.createTextNode(beforeText), node);
          }
        }

        
        const span = document.createElement('span');
        span.style.display = 'inline';
        
        try {
          katex.render(latex, span, {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false
          });
        } catch (error) {
          console.error('Erro ao renderizar KaTeX (inline):', error);
          span.textContent = fullMatch;
        }
        
        parent.insertBefore(span, node);

        
        text = text.substring(index + fullMatch.length);
        offset = 0;
      });

      
      if (text) {
        parent.insertBefore(document.createTextNode(text), node);
      }

      parent.removeChild(node);
    });
  }

  private processTableMath(element: HTMLElement): void {
    
    const tables = element.querySelectorAll('table');
    
    tables.forEach(table => {
      
      const cells = table.querySelectorAll('td, th');
      
      cells.forEach(cell => {
        let html = cell.innerHTML;
        
        
        html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
          const span = document.createElement('span');
          span.style.display = 'block';
          span.style.margin = '5px 0';
          
          try {
            katex.render(latex, span, {
              displayMode: true,
              throwOnError: false,
              errorColor: '#cc0000',
              strict: false
            });
            return span.outerHTML;
          } catch (error) {
            console.error('Erro ao renderizar KaTeX em tabela (bloco):', error);
            return match;
          }
        });
        
        const inlineRegex = /\$([^\$]+?)\$/g;
        let tempHtml = html;
        let lastIndex = 0;
        let result = '';
        let match: RegExpExecArray | null;
        
        while ((match = inlineRegex.exec(html)) !== null) {
          
          const beforeMatch = html.substring(0, match.index);
          const afterMatch = html.substring(match.index + match[0].length);
          
          if (beforeMatch.endsWith('$') || afterMatch.startsWith('$')) {
            continue;
          }
          
          const span = document.createElement('span');
          span.style.display = 'inline';
          
          try {
            katex.render(match[1], span, {
              displayMode: false,
              throwOnError: false,
              errorColor: '#cc0000',
              strict: false
            });
            
            result += tempHtml.substring(lastIndex, match.index) + span.outerHTML;
            lastIndex = match.index + match[0].length;
          } catch (error) {
            console.error('Erro ao renderizar KaTeX em tabela (inline):', error);
            result += tempHtml.substring(lastIndex, match.index + match[0].length);
            lastIndex = match.index + match[0].length;
          }
        }
        
        result += tempHtml.substring(lastIndex);
        html = result || html;
        
        cell.innerHTML = html;
      });
    });
  }
}
