import { Component, ChangeDetectorRef } from '@angular/core';
import { ReceptorService } from '../../../service/api/receptor.service';
import { Table } from 'primeng/table/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';
import { Receptor } from 'src/app/util/domain/Receptor';

@Component({
  selector: 'app-recepteur',
  templateUrl: './recepteur.component.html',
  styleUrls: ['./recepteur.component.scss'],
})
export class RecepteurComponent {
  entitys!: Receptor[];
  entity!: Receptor;
  selectedEntitys!: Receptor[];
  selectedStatus!: { boolean: boolean; name: string };
  selectedStudentName!: string[];
  cols!: any[];
  status: any[] = [
    { boolean: false, name: 'Disabled' },
    { boolean: true, name: 'Enabled' },
  ];
  studentsName: any[] = [];
  loading: boolean = true;
  submitted: boolean = false;
  entityDialog: boolean = false;
  filteredEntities: Receptor[] = [];
  first = 0;
  rows = 10;

  constructor(
    private receptorService: ReceptorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'email', header: 'Username', filter: true },
      { field: 'password', header: 'Password', filter: true },
      { field: 'name', header: 'Nom', filter: true },
      { field: 'status', header: 'Status', filter: true },
    ];
    this.receptorService.getAllReceptors().subscribe(
      (data) => {
        this.entitys = data;
        this.filteredEntities = [...this.entitys];
        this.loading = false;
        console.log(data);
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

  editEntity(receptor: Receptor) {
    receptor.password = '';
    this.entity = { ...receptor };
    this.entityDialog = true;
  }

  deleteEntity(receptor: Receptor) {
    this.confirmationService.confirm({
      message:
        'Etes-vous sûr que vous voulez supprimer ' + receptor.email + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.receptorService
          .deleteReceptor({
            id: receptor.id,
          })
          .subscribe(
            (data: any) => {
              this.entitys = this.entitys.filter(
                (val) => val.id !== receptor.id
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
               || entity.name?.toString().toLowerCase().includes(searchTerm) ;
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
        this.receptorService.deleteAllReceptors(extractedIds).subscribe(
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
        this.receptorService
          .editReceptor({
            id: this.entity.id,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
            name: this.entity.name,
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
        this.receptorService
          .addReceptor({
            id: null,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
            name: this.entity.name,
          })
          .subscribe(
            (data: Receptor) => {
              this.entitys.push({
                id: data.id,
                email: data.email,
                password: data.password,
                status: data.status,
                name: data.name,
              });
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Receptor Created',
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

  clear(table: Table) {
    table.clear();
  }
}
