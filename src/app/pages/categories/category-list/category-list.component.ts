import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../shared/category.service';
import { Category } from '../shared/category.model';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  categories: Category[] = [];

  constructor(
    private categoryServive: CategoryService
  ) { }

  ngOnInit() {
    this.categoryServive.getAll().subscribe(categories => this.categories = categories,
      error => alert('Erro ao carregar a lista'));
  }

  deleteCategory(category) {
    const mustDelete: boolean = confirm('Deseja mesmo deletar está categoria?');
    if (mustDelete) {
      this.categoryServive.delete(category.id).subscribe(
        () => this.categories = this.categories.filter(element => element !== category),
        error => alert('Erro ao tentar excçuir'));
    }


  }

}
