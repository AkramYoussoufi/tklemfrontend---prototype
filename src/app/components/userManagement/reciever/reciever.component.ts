import { Component, ChangeDetectorRef } from '@angular/core';
import { RecieverService } from '../../../service/api/reciever.service';
import { FormationService } from 'src/app/service/api/formation.service';
import { Table } from 'primeng/table/table';
import { MessageService, ConfirmationService, Message } from 'primeng/api';
import { finalize } from 'rxjs';
import { Reciever } from 'src/app/util/domain/Reciever';

@Component({
  selector: 'app-reciever',
  templateUrl: './reciever.component.html',
  styleUrls: ['./reciever.component.scss'],
})
export class RecieverComponent {
  entitys!: Reciever[];
  entity!: Reciever;
  selectedEntitys!: Reciever[];
  selectedStatus!: { boolean: boolean; name: string };
  selectedStudentName!: string[];
  formations: any[] = [];
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
  filteredEntities: Reciever[] = [];
  passwordDialog: boolean = false;
  addDialog: boolean = false;
  constructor(
    private recieverService: RecieverService,
    private formationService: FormationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'email', header: 'Username', filter: true },
    //  { field: 'password', header: 'Password', filter: true },
      { field: 'name', header: 'Nom', filter: true },
      { field: 'formationName', header: 'Formation', filter: true },
      { field: 'status', header: 'Status', filter: true },
    ];
    this.recieverService.getAllRecievers().subscribe(
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
    this.formationService.getAllFormations().subscribe(
      (data) => {
        data.forEach((type: any) => {
          this.formations.push(type.name);
        });
      },
      (error) => {}
    );
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
    this.addDialog = true;
    this.submitted = false;
  }

  editEntity(reciever: Reciever) {
    reciever.password = '';
    this.entity = { ...reciever };
    this.entityDialog = true;
  }
  editPassword(reciever: Reciever) {
    this.entity = { ...reciever };
    this.entity.password = '';
    this.passwordDialog = true;
  }
  deleteEntity(reciever: Reciever) {
    this.confirmationService.confirm({
      message:
        'Etes-vous sûr que vous voulez supprimer ' + reciever.email + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.recieverService
          .deleteReciever({
            id: reciever.id,
          })
          .subscribe(
            (data: any) => {
              this.entitys = this.entitys.filter(
                (val) => val.id !== reciever.id
              );
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
  onGlobalSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    if (searchTerm) {
      this.filteredEntities = this.entitys.filter((entity) => {
        return entity.email?.toLowerCase().includes(searchTerm)
               || entity.status?.toString().toLowerCase().includes(searchTerm)
               || entity.name?.toString().toLowerCase().includes(searchTerm)
               || entity.formationName?.toString().toLowerCase().includes(searchTerm) ;
      });
    } else {
      this.filteredEntities = [...this.entitys];
    }
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
        this.recieverService.deleteAllRecievers(extractedIds).subscribe(
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
    this.addDialog = false;
    this.submitted = false;
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
        this.recieverService
          .editReciever({
            id: this.entity.id,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
            name: this.entity.name,
            formationName: this.entity.formationName,
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
                formationName: data.formationName,
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
        this.recieverService
          .addReciever({
            id: null,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
            name: this.entity.name,
            formationName: this.entity.formationName,
          })
          .subscribe(
            (data: Reciever) => {
              this.entitys.push({
                id: data.id,
                email: data.email,
                password: data.password,
                status: data.status,
                name: data.name,
                formationName: data.formationName,
              });
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Reciever Created',
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
      this.addDialog = false;
      this.entity = {};
    }
  }
  editPasswordProduct() {
    this.submitted = true;
    if (this.entity.email?.trim()) {
      const index: any = this.entity.id;
        this.recieverService
          .editReceiverPassword({
            id: this.entity.id,
            email: this.entity.email,
            password: this.entity.password,
            status: this.entity.status,
            name: this.entity.name,
            formationName: this.entity.formationName,
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
