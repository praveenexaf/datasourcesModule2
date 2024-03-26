import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
// import { HelloComponent } from './hello.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
// import { ConditionFormComponent } from './condition-form/condition-form.component';
// import { ActionButtonsBarComponent } from './action-buttons-bar/action-buttons-bar.component';
import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConditionFormComponent } from './condition-form/condition-form.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    NgMultiSelectDropDownModule,
  ],
  declarations: [AppComponent,ConditionFormComponent],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {

}
