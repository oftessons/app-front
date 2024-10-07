import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import Quill from 'quill';

const Image = Quill.import('formats/image');

class ImageResize extends Image {
  static create(value: any) {
    const node = super.create(value);
    const size = value.size || '300px';
    node.setAttribute('style', `width: ${size}; height: auto;`); // Defina o tamanho desejado
    return node;
  }

  static value(domNode: any) {
    return {
      alt: domNode.getAttribute('alt'),
      size: domNode.style.width
    };
  }
}

Quill.register(ImageResize, true);

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ImageResizeModule { }
