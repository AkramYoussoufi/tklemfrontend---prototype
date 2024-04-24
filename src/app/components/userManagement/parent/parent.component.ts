import { Component, ChangeDetectorRef } from '@angular/core';
import { Parent } from '../../../util/domain/Parent';
import { ParentService } from '../../../service/api/parent.service';
import { StudentService } from 'src/app/service/api/student.service';
import { Table } from 'primeng/table/table';
import { MessageService, ConfirmationService, Message } from 'primeng/api';
import { finalize } from 'rxjs';
import { Student } from 'src/app/util/domain/Student';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.scss'],
})
export class ParentComponent {
  messages: Message[] = [];

  entitys!: Parent[];
  entity!: Parent;
  selectedEntitys!: Parent[];
  selectedStatus!: { boolean: boolean; name: string };
  filteredEntities: Parent[] = [];
  selectedStudentName!: string[] | undefined;
  cols!: any[];
  status: any[] = [
    { boolean: false, name: 'Disabled' },
    { boolean: true, name: 'Enabled' },
  ];
  studentsName: any[] = [];
  loading: boolean = true;
  submitted: boolean = false;
  entityDialog: boolean = false;
  first = 0;
  rows = 10;
  passwordDialog: boolean = false;

  constructor(
    private parentService: ParentService,
    private studentService: StudentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'email', header: 'Email', filter: true },
      { field: 'name', header: 'Nom', filter: true },
      { field: 'cin', header: 'CIN', filter: true },
      { field: 'studentsNames', header: 'Les etudiants', filter: true },
      { field: 'status', header: 'Status', filter: true },
    ];
    this.parentService.getAllParents().subscribe(
      (data) => {
        this.entitys = data;
        this.filteredEntities = [...this.entitys];
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Failure',
          detail: error.message,
          life: 3000,
        });
      }
    );
    this.studentService.getAllStudents().subscribe((data: Student[]) => {
      data.forEach((element) => this.studentsName.push(element.name));
      console.log(this.studentsName);
    });
  }

  ngAfterViewInit() {}

  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  isLastPage(): boolean {
    return this.entitys ? this.first === this.entitys.length - this.rows : true;
  }

  isFirstPage(): boolean {
    return this.entitys ? this.first === 0 : true;
  }

  openNew() {
    this.entity = {};
    this.submitted = false;
    this.entityDialog = true;
  }

  editEntity(parent: Parent) {
    this.entity = { ...parent };
    this.selectedStudentName = parent.studentsNames;
    this.entityDialog = true;

  }

  editPassword(parent: Parent) {
    this.entity = { ...parent };
    this.entity.password = '';
    this.passwordDialog = true;
  }
  deleteEntity(parent: Parent) {
    this.confirmationService.confirm({
      message: 'Etes-vous sûr que vous voulez supprimer ' + parent.email + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.parentService
          .deleteParent({
            id: parent.id,
          })
          .subscribe(
            (data: any) => {
              this.entitys = this.entitys.filter((val) => val.id !== parent.id);
              this.filteredEntities = [...this.entitys];
              this.entity = {};
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: data.message,
                life: 3000,
              });
            },
            (error) => {
              this.entity = {};
              this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: error.message,
                life: 3000,
              });
            }
          );
      },
    });
  }

  deleteSelectedEntitys() {
    console.log(this.selectedEntitys);
    const extractedIds = this.selectedEntitys?.map((entity) => {
      return { id: entity.id };
    });
    console.log(extractedIds);
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer les étudiants sélectionnés?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.parentService.deleteAllParents(extractedIds).subscribe(
          (data: any) => {
            this.entitys = this.entitys.filter(
              (val) => !this.selectedEntitys?.includes(val)
            );
            this.filteredEntities = [...this.entitys];
            this.selectedEntitys = [];
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: data.message,
              life: 3000,
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failure',
              detail: "échec de la suppression de l'objet sélectionné",
              life: 3000,
            });
          }
        );
      },
    });
  }

  hideDialog() {
    this.entityDialog = false;
    this.passwordDialog = false;
    this.submitted = false;
  }
  onGlobalSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    if (searchTerm) {
      this.filteredEntities = this.entitys.filter((entity) => {
        return entity.email?.toLowerCase().includes(searchTerm)
               || entity.status?.toString().toLowerCase().includes(searchTerm)
               || entity.name?.toString().toLowerCase().includes(searchTerm)
               || entity.cin?.toString().toLowerCase().includes(searchTerm);
      });
    } else {
      this.filteredEntities = [...this.entitys];
    }
  }
  getStatus(status: boolean | undefined) {
    console.log(status);
    switch (status) {
      case true:
        return 'Enabled';
      case false:
        return 'Disabled';
      default:
        return 'Choisissez le statut';
    }
  }

  getSeverity(status: boolean | undefined) {
    switch (status) {
      case true:
        return 'success';
      case false:
        return 'error';
      default:
        return 'info';
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.entitys.length; i++) {
      if (this.entitys[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  saveProduct() {
    this.submitted = true;
    console.log(this.entity);
    if (this.entity.email?.trim()) {
      const index: any = this.entity.id;
      if (this.entity.id) {
        this.parentService
          .editParent({
            id: this.entity.id,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
            name: this.entity.name,
            studentsNames: this.selectedStudentName,
            cin: this.entity.cin,
          })
          .subscribe(
            (data: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: "L'Objet a été modifiée avec succès",
                life: 3000,
              });
              this.entitys[this.findIndexById(index)] = {
                id: data.id,
                email: data.email,
                password: data.password,
                status: data.status,
                name: data.name,
                studentsNames: data.studentsNames,
                cin: data.cin,
              };
              this.entitys = [...this.entitys];
              this.filteredEntities = [...this.entitys];
            },
            (error) => {
              console.log(error);
              this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: "échec de la modification de l'objet sélectionné",
                life: 3000,
              });
            }
          );
      } else {
        this.parentService
          .addParent({
            id: null,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
            name: this.entity.name,
            studentsNames: this.selectedStudentName,
            cin: this.entity.cin,
          })
          .subscribe(
            (data: Parent) => {
              this.entitys.push({
                id: data.id,
                email: data.email,
                password: data.password,
                status: data.status,
                name: data.name,
                studentsNames: data.studentsNames,
                cin: data.cin,
              });
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Parent Created',
                life: 3000,
              });
              this.entitys = [...this.entitys];
              this.filteredEntities = [...this.entitys];
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: "échec de la ajoute de l'objet",
                life: 3000,
              });
            }
          );
      }
      this.entityDialog = false;
      this.entity = {};
    }
  }

  editPasswordProduct() {
    this.submitted = true;
    if (this.entity.email?.trim()) {
      const index: any = this.entity.id;
        this.parentService
          .editParentPassword({
            id: this.entity.id,
            email: this.entity.email,
            password: this.entity.password,
            status: true,
            name: this.entity.name,
            studentsNames: this.selectedStudentName,
            cin: this.entity.cin,
          })
          .subscribe(
            (data: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: "L'Objet a été modifiée avec succès",
                life: 3000,
              });
            },
            (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: "échec de la modification de l'objet sélectionné",
                life: 3000,
              });
            }
          );
      this.passwordDialog = false;
      this.entity = {}
    }
  }

  clear(table: Table) {
    table.clear();
  }
}
