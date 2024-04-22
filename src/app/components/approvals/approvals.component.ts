import { Component } from '@angular/core';
import { Student } from '../../util/domain/Student';
import { Table } from 'primeng/table/table';
import { MessageService } from 'primeng/api';
import { DemandeService } from '../../service/api/demande.service';
import { Demande } from '../../util/domain/Demande';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
})
export class ApprovalsComponent {
  demandes: Demande[] = [];
  entity!: Demande;
  selectedEntitys!: Student[] | null;
  cols!: any[];
  formations: any[] = [];
  loading: boolean = false;
  submitted: boolean = false;
  entityDialog: boolean = false;
  first = 0;
  rows = 10;
  filteredEntities: Demande[] = [];
  constructor(
    private messageService: MessageService,
    private demandeService: DemandeService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'name', header: 'Nom', filter: true },
      { field: 'massarCode', header: 'Massar Code', filter: true },
      { field: 'formationName', header: 'Formation', filter: true },
    ];
    this.demandeService.getAllDemands().subscribe(
      (data) => {
        this.demandes = data;
        this.filteredEntities = [...this.demandes];
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failure',
          detail:
            "Une erreur s'est produite lors de la tentative de récupération des demandes",
          life: 60000,
        });
      }
    );
  }
  onGlobalSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    if (searchTerm) {
      this.filteredEntities = this.demandes.filter((demande) => {
        const matchesDemandeName = demande.name?.toLowerCase().includes(searchTerm);
        const matchesStudent = demande.students?.some(student => 
          student.massarCode?.toLowerCase().includes(searchTerm) ||
          student.formationName?.toLowerCase().includes(searchTerm)
        );
        return matchesDemandeName || matchesStudent;
      });
    } else {
      this.filteredEntities = [...this.demandes];
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
    return this.demandes
      ? this.first === this.demandes.length - this.rows
      : true;
  }

  isFirstPage(): boolean {
    return this.demandes ? this.first === 0 : true;
  }

  declineDemande(id: number) {
    this.demandeService.declineDemand(id).subscribe(
      (data) => {
        this.demandes = this.demandes.filter((val) => val.id !== id);
        this.filteredEntities = [...this.demandes];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Demande Refuse',
          life: 3000,
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failure',
          detail: "Quelque chose s'est mal passé",
          life: 3000,
        });
      }
    );
  }

  acceptDemande(id: number) {
    this.demandeService.acceptDemand(id).subscribe(
      (data) => {
        this.demandes = this.demandes.filter((val) => val.id !== id);
        this.filteredEntities = [...this.demandes];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Demande Accepte',
          life: 3000,
        });
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failure',
          detail: "Quelque chose s'est mal passé",
          life: 3000,
        });
      }
    );
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.demandes.length; i++) {
      if (this.demandes[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  clear(table: Table) {
    table.clear();
  }
}
