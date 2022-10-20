import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() {

    //this.playAudio();

  }
  playAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/audio/ea.mp3";
    audio.load();
    audio.play();
  }
}
