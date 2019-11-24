import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { switchMap } from 'rxjs/operators';
import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import toastr from 'toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  // tslint:disable-next-line:no-inferrable-types
  submittingForm: boolean = false;
  category: Category = new Category();


  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }
  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    console.log(this.currentAction);
    this.submittingForm = true;
    this.currentAction === 'new' ? this.createCategory() : this.updateCategory();
  }

  private setCurrentAction() {
    this.currentAction = this.route.snapshot.url[0].path === 'new' ? 'new' : 'edit';
  }
  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }
  private loadCategory() {
    if (this.currentAction === 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get('id')))
      ).subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(category); // binds loaded category data to CategoryForm
        },
        error => alert('Ops! Algo deu errado. Tente novamente mais tarde.')
      );
    }

  }
  private setPageTitle() {
    this.pageTitle = this.currentAction === 'new' ? 'Cadastro de nova Categoria' : `Editando a Categoria ${this.category.name || ''}`;
  }

  private createCategory() {
    // tslint:disable-next-line:new-parens
    const category: Category = Object.assign(new Category, this.categoryForm.value);
    this.categoryService.create(category)
      .subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        (category) => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      );
  }
  private updateCategory() {
    // tslint:disable-next-line:new-parens
    const category: Category = Object.assign(new Category, this.categoryForm.value);
    this.categoryService.update(category)
    .subscribe(
      // tslint:disable-next-line:no-shadowed-variable
      (category) => this.actionsForSuccess(category),
      error => this.actionsForError(error)
    );

  }
  private actionsForSuccess(category: Category) {
    toastr.success('Solicitação processada com sucesso!');
    this.router.navigateByUrl('categories', { skipLocationChange: true }).then(
      () => this.router.navigate(['categories', category.id, 'edit'])
    );
  }
  private actionsForError(error) {
    toastr.error('Erro ao processar sua solicitação!');
    this.submittingForm = false;
    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor tente mais tarde'];

    }
  }

}
