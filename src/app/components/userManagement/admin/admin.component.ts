import {
  AfterViewInit,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Admin } from '../../../util/domain/Admin';
import { AdminService } from '../../../service/api/admin.service';
import { Table } from 'primeng/table/table';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class AdminComponent implements OnInit, AfterViewInit {
  entitys!: Admin[];
  entity!: Admin;
  selectedEntitys!: Admin[];
  selectedStatus!: { boolean: boolean; name: string };
  cols!: any[];
  status: any[] = [
    { boolean: false, name: 'Disabled' },
    { boolean: true, name: 'Enabled' },
  ];
  loading: boolean = true;
  submitted: boolean = false;
  entityDialog: boolean = false;
  first = 0;
  rows = 10;
  filteredEntities: Admin[] = [];
  
  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'email', header: 'Username', filter: true },
      { field: 'password', header: 'Password', filter: true },
      { field: 'status', header: 'Status', filter: true },
    ];
    this.adminService.getAllAdmins().subscribe(
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
    this.entitys = [...this.entitys];
  }

  ngAfterViewInit() {}
  onGlobalSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  
    if (searchTerm) {
      this.filteredEntities = this.entitys.filter((entity) => {
        return entity.email?.toLowerCase().includes(searchTerm)
               || entity.status?.toString().toLowerCase().includes(searchTerm);
      });
    } else {
      this.filteredEntities = [...this.entitys];
    }
  }
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

  editEntity(admin: Admin) {
    admin.password = '';
    this.entity = { ...admin };
    this.entityDialog = true;
  }

  deleteEntity(admin: Admin) {
    this.confirmationService.confirm({
      message: 'Etes-vous sûr que vous voulez supprimer ' + admin.email + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService
          .deleteAdmin({
            id: admin.id,
          })
          .subscribe(
            (data: any) => {
              this.entitys = this.entitys.filter((val) => val.id !== admin.id);
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
                detail: error.error.message,
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
    console.log({
      id: this.entity.id,
      email: this.entity.email,
      password: this.entity.password,
      status: this.selectedStatus.boolean,
    });
    if (this.entity.email?.trim()) {
      const index: any = this.entity.id;
      if (this.entity.id) {
        console.log({
          id: this.entity.id,
          email: this.entity.email,
          password: this.entity.password,
          status: this.selectedStatus.boolean,
        });
        this.adminService
          .editAdmin({
            id: this.entity.id,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
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
        this.adminService
          .addAdmin({
            id: null,
            email: this.entity.email,
            password: this.entity.password,
            status: this.selectedStatus.boolean,
          })
          .subscribe(
            (data: Admin) => {
              this.entitys.push({
                id: data.id,
                email: data.email,
                password: data.password,
                status: data.status,
              });
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Admin Created',
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
