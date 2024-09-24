import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TinymceService {
  apiKey: string = environment.tinymceApiKey;

  getEditorConfig() {
    return {
      apiKey: this.apiKey,
      language: 'pt_BR',
      height: 300,
      menubar: true,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount',
        'textcolor'
      ],
      toolbar:
        'undo redo | formatselect | bold italic forecolor backcolor | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | removeformat | help',
    };
  }
}
