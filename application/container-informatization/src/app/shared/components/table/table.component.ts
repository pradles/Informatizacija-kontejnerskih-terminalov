import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterModule ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit{
  data: any[] = [];
  dataType: string = '';
  selectedRows: any[] = [];

  setTableData(providedData: any, providedDataType: string) {
    this.data = providedData;
    this.dataType = providedDataType;
    console.log(this.data);
    this.filteredData = this.data;
    if (this.data.length > 0) {
      this.columns = Object.keys(this.data[0]);
    }
  }
  searchQuery: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  filteredData: any[] = [];
  columns: string[] = [];

  ngOnInit(): void {
    
  }

  onSearch() {
    this.filteredData = this.data.filter((col: any) =>
      this.columns.some(column => {
        const value = col[column];
        if (value !== undefined && value !== null) {
          return value.toString().toLowerCase().includes(this.searchQuery.toLowerCase());
        }
        return false;
      })
    );
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  clearSort() {
    this.filteredData = [...this.data];
    this.sortColumn = '';
    this.sortDirection = 'asc';
  }

  isDate(value: any): boolean {
    // Regex to match ISO 8601 date strings
    const isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (typeof value === 'string' && isoDateFormat.test(value)) {
      const date = new Date(value);
      return !isNaN(date.valueOf());
    }
    return false;
  }

  delete() {
    // call the appropriate delete function based on this.dataType
  }

  transformColumnName(column: string | null): string {
    // if(column == '_id')
    //   return '_id';
    if (!column) return '';
      return column.match(/[A-Z][a-z]+|[0-9]+|_[a-z]+/g)?.join(' ') || ''; 
  }

  columnFilterOpen: string = '';

  toggleFilter(column: string): void {
    if(this.columnFilterOpen == column)
      this.columnFilterOpen = '';
    else
      this.columnFilterOpen = column;
  }

  toggleRowSelection(data: any) {
    const index = this.selectedRows.findIndex(row => row === data);
    if (index === -1) {
      this.selectedRows.push(data); // Add row data if not already selected
    } else {
      this.selectedRows.splice(index, 1); // Remove row data if already selected
    }
    console.log('Selected Rows:', this.selectedRows); // Log the updated array
  }
  
}

