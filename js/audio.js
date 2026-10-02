const AudioPlayer={music:new Audio(),engine:new Audio('assets/audio/engine.mp3'),idle:new Audio('assets/audio/idle.mp3'),tires:new Audio('assets/audio/tires.mp3'),requested:false,
 init(){this.music.preload='none';for(const el of [this.engine,this.idle,this.tires]){el.preload='none';el.loop=true;el.volume=0;el.preservesPitch=false;}this.music.addEventListener('ended',()=>this.shuffleMode?this.random():this.next(1));this.select(Save.state.settings.track||0,false);document.addEventListener('visibilitychange',()=>{if(document.hidden){this.pause();this.stopGame();}});},
 select(i,play=true){const s=Save.state.settings,tracks=Economy.audioTracks();if(!tracks.length){this.pause();return false;}s.track=tracks.includes(i)?i:tracks[0];this.music.src=CATALOG.music[s.track];this.music.volume=s.volume;Save.persist();if(play&&s.music)this.play();return true;},
 play(){if(!this.requested||!Save.state.settings.music||document.hidden||!Economy.audioTracks().length)return;const epoch=this.musicEpoch||0;this.music.play().then(()=>{if(epoch!==(this.musicEpoch||0)||!this.requested||document.hidden)this.music.pause();}).catch(()=>{});},
 pause(){this.musicEpoch=(this.musicEpoch||0)+1;this.requested=false;this.music.pause();},
 next(d){this.shuffleMode=false;const tracks=Economy.audioTracks();if(!tracks.length)return;const at=Math.max(0,tracks.indexOf(Save.state.settings.track));this.select(tracks[(at+d+tracks.length)%tracks.length]);window.UI?.renderMusic?.();},
 random(){this.shuffleMode=true;const available=Economy.audioTracks(),current=Save.state.settings.track;if(!available.length)return;this.shuffle=(this.shuffle||[]).filter(i=>available.includes(i)&&i!==current);if(!this.shuffle.length){this.shuffle=available.filter(i=>i!==current);for(let i=this.shuffle.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.shuffle[i],this.shuffle[j]]=[this.shuffle[j],this.shuffle[i]];}}this.select(this.shuffle.pop()??current);window.UI?.renderMusic?.();},
 impact(){if(gameRunning&&!gamePaused&&Save.state.settings.effects!==false){initAudio();beep(65,.13,.08,'sawtooth');}},
 setMusic(on){if(on&&!Economy.audioTracks().length){window.UI?.toast('Купи аудиосистему в LOUD SOUND и установи в AR DRIVE');return false;}Save.state.settings.music=on;this.requested=on;if(on){this.select(Save.state.settings.track,false);this.play();}else this.pause();Save.persist();return true;},
 stopGame(){this.gameEpoch=(this.gameEpoch||0)+1;this.state='AUDIO_STOPPED';for(const el of [this.engine,this.idle,this.tires]){el.pause();el.volume=0;el.currentTime=0;}if(typeof gameAudioNodes!=='undefined')for(const o of gameAudioNodes){try{o.stop();o.disconnect();}catch(e){}gameAudioNodes.delete(o);}if(typeof audioCtx!=='undefined'&&audioCtx?.state==='running')audioCtx.suspend?.();},
 smooth(el,volume,rate=1){el.volume+=(volume-el.volume)*.24;el.playbackRate+=(rate-el.playbackRate)*.16;if(volume>0&&el.paused&&!el.starting){el.starting=true;const epoch=this.gameEpoch||0;el.play().then(()=>{if(epoch!==(this.gameEpoch||0)||!gameRunning||gamePaused||document.hidden){el.pause();el.volume=0;}}).catch(()=>{}).finally(()=>el.starting=false);}if(volume===0&&el.volume<.002){el.pause();el.volume=0;}},
 update(){const s=Save.state.settings,on=gameRunning&&!gamePaused&&!document.hidden,v=car?Math.hypot(car.vx,car.vy):0,a=car?Math.abs(wrap(Math.atan2(car.vy,car.vx)-car.angle)):0;
  if(!on){if(this.state!=='AUDIO_STOPPED')this.stopGame();return;}this.state='GAME_AUDIO_ACTIVE';
  const rpm=Math.min(1,v/13+(keys.ArrowUp ? .15 : 0)),engineOn=on&&s.engine!==false,drifting=on&&v>Dynamics.driftSpeed&&a>Dynamics.driftAngle*Math.PI/180&&s.drift!==false;
  this.smooth(this.idle,engineOn?.14*(1-rpm):0,.9+rpm*.25);
  this.smooth(this.engine,engineOn?.18*rpm:0,.9+rpm*.45);
  this.smooth(this.tires,drifting?Math.min(.32,.1+a*.13):0,.94+Math.min(.13,v*.004));
 }
};
AudioPlayer.init();setInterval(()=>AudioPlayer.update(),50);
