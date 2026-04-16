import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, ToolbarModule, AvatarModule, InputTextModule, TooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  authService = inject(AuthService);
  user = this.authService.currentUser;

 

}