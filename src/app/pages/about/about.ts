import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class AboutComponent implements OnInit {
  company: any = null;
  constructor(private data: DataService) {}
  ngOnInit(): void { this.data.getCompany().subscribe(c => this.company = c); }
}
