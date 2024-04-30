import {
  AfterViewInit,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Student } from '../../util/domain/Student';
import { StudentService } from '../../service/api/student.service';
import { Table } from 'primeng/table/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormationService } from '../../service/api/formation.service';
import { Formation } from '../../util/domain/Formation';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class StudentsComponent implements OnInit, AfterViewInit {
  entitys!: Student[];
  entity!: Student;
  selectedEntitys!: Student[] | null;
  cols!: any[];
  formations: any[] = [];
  loading: boolean = true;
  submitted: boolean = false;
  entityDialog: boolean = false;
  first = 0;
  rows = 10;
filteredEntities: Student[] = [];
  constructor(
    private studentService: StudentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formationService: FormationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'name', header: 'Nom', filter: true },
      { field: 'massarCode', header: 'Massar Code', filter: true },
      { field: 'formationName', header: 'Formation', filter: true },
    ];
    this.studentService.getAllStudents().subscribe(
      (data) => {
        this.entitys = data;
        this.filteredEntities = [...this.entitys];
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
    this.formationService.getAllFormations().subscribe(
      (data) => {
        data.forEach((type: Formation) => {
          this.formations.push(type.name);
        });
      },
      (error) => {}
    );
  }

  ngAfterViewInit() {}
  onGlobalSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();

    if (searchTerm) {
      this.filteredEntities = this.entitys.filter((entity) => {
        return entity.name?.toLowerCase().includes(searchTerm)
               || entity.massarCode?.toLowerCase().includes(searchTerm)
               || entity.formationName?.toLowerCase().includes(searchTerm);
      });
    } else {
      this.filteredEntities = [...this.entitys];
    }
  }
  onUpload(event: UploadEvent) {
    const selectedFile = event.files[0];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    fileReader.onload = (file: any) => {
      let binaryData = file.target.result;
      let workbook = XLSX.read(binaryData, { type: 'binary' });
      workbook.SheetNames.forEach((sheet) => {
        const data: any = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

        const formation = data[5].I;
        const rows: any = data.slice(7);
        const resdata: any = [];
        rows.forEach((element: any) => {
          resdata.push({
            name: element.F + ' ' + element.D,
            massarCode: element.C,
            formationName: formation,
          });
        });
        this.studentService.addAllStudents(resdata).subscribe(
          (data) => {
            window.location.reload();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failure',
              detail: "Quelque chose s'est mal passé lors de la tentative.",
              life: 3000,
            });
          }
        );
      });
    };
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

  deleteSelectedEntitys() {
    const extractedIds = this.selectedEntitys?.map((entity) => entity.id);
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer les étudiants sélectionnés?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.studentService.deleteAllStudent(extractedIds).subscribe(
          (data: any) => {
            this.entitys = this.entitys.filter(
              (val) => !this.selectedEntitys?.includes(val)
            );
            this.filteredEntities = [...this.entitys];
            this.selectedEntitys = null;
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Tous les étudiants ont été supprimés',
              life: 3000,
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failure',
              detail:
                "Quelque chose s'est mal passé lors de la tentative de suppression d'un élève. Il s'agit probablement d'une demande d'un parent qui doit être traitée en premier",
              life: 3000,
            });
          }
        );
      },
    });
  }

  openNew() {
    this.entity = {};
    this.submitted = false;
    this.entityDialog = true;
  }

  editEntity(student: Student) {
    this.entity = { ...student };
    this.entityDialog = true;
  }

  deleteEntity(student: Student) {
    this.confirmationService.confirm({
      message: 'Etes-vous sûr que vous voulez supprimer ' + student.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.studentService
          .deleteStudent({
            id: student.id,
          })
          .subscribe(
            (data: any) => {
              this.entitys = this.entitys.filter(
                (val) => val.id !== student.id
              );
              this.filteredEntities = [...this.entitys];
              this.entity = {};
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: "L'élève a été supprimé",
                life: 3000,
              });
            },
            (error) => {
              this.entity = {};
              this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail:
                  "Quelque chose s'est mal passé lors de la tentative de suppression d'un élève. Il s'agit probablement d'une demande d'un parent qui doit être traitée en premier",
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

    if (this.entity.name?.trim()) {
      const index: any = this.entity.id;
      if (this.entity.id) {
        this.studentService.editStudent(this.entity).subscribe(
          (data: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: "L'Objet a été modifiée avec succès",
              life: 3000,
            });
            this.entitys[this.findIndexById(index)] = {
              id: data.id,
              name: data.name,
              massarCode: data.massarCode,
              formationName: data.formation.name,
            };
            this.entitys = [...this.entitys];
            this.filteredEntities = [...this.entitys];
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
      } else {
        this.studentService.addStudent(this.entity).subscribe(
          (data: any) => {
            this.entitys.push({
              id: data.id,
              name: data.name,
              massarCode: data.massarCode,
              formationName: data.formation.name,
            });
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Student Created',
              life: 3000,
            });
            this.entitys = [...this.entitys];
            this.filteredEntities = [...this.entitys];
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Failure',
              detail: error.error.message,
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
