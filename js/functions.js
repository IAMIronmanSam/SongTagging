var database = {};
database.webdb = {};
var fileSystem;

function $(id) {return document.getElementById(id);}

function d(idz,action,slide,speed,fade) {
	if((speed==null) || (speed==undefined)) speed = '';
	if((fade==null) || (fade==undefined)) fade = '';
	var ids = idz.split(',');
	if(ids.length==1) {
		var id = idz;
		var element = $(id);
		if(element!=null) {
			if(action=='show') {
				if((slide=='slide') || (slide=='slideShow')) {
					if(element.style.display!='block') {
						var h = 0;
						var op;
						if((fade=='fade') || (fade=='fadeShow')) op = 0; else op = 10;
						element.style.overflow='hidden';
						element.style.paddingBottom='0px';
						element.style.height='auto';
						if((fade=='fade') || (fade=='fadeShow')) element.style.opacity='0.0'; else if(fade=='fadeHide') element.style.opacity='1.0';
						element.style.display='block';
						var h2 = element.clientHeight;
						divSlide2();
						function divSlide2() { 
							if(h<h2) { 
								element.style.height = h+'px';
								if((speed=='slow') && (h>=h2-20)) j=1;
								else if((speed=='slow') || ((speed=='') && (h>=h2-20))) j=2;
								else if((speed=='') || ((speed=='fast') && (h>=h2-20))) j=4;
								else if(speed=='fast') j=10;
								else j=4;
								h=h+j;
								setTimeout(divSlide2,1);
							} else {
								element.style.height='';
								divOpacity2();
							}
						}
						function divOpacity2() { 
							if(op<10) { 
								element.style.opacity = '0.'+op;
								op = op+1;
								setTimeout(divOpacity2,60);
							} else {
								element.style.opacity='1.0';
							}
						}
					}
				} else {
					element.style.display='block';
					element.style.opacity='1.0';
				}
			} else if(action=='hide') {
				if((slide=='slide') || (slide=='slideHide')) {
					var op;
					if((fade=='fade') || (fade=='fadeHide')) op = 9; else op = 0;
					element.style.overflow='hidden';
					element.style.paddingBottom='0px';
					element.style.opacity='1.0';
					var h = element.clientHeight;
					var h2 = h;
					divOpacity1()
					function divOpacity1() { 
						if(op>0) { 
							element.style.opacity = '0.'+op;
							op = op-1;
							setTimeout(divOpacity1,40);
						} else {
							if((fade=='fade') || (fade=='fadeHide')) element.style.opacity='0.0';
							divSlide1();
						}
					} 
					function divSlide1() { 
						if(h>0) { 
							element.style.height = h+'px';
							if((speed=='slow') && (h<=20)) h=h-1;
							else if((speed=='slow') || ((speed=='') && (h<=20))) h=h-2;
							else if((speed=='') || ((speed=='fast') && (h<=20))) h=h-4;
							else if(speed=='fast') h=h-10;
							else h=h-4;
							setTimeout(divSlide1,1);
						} else {
							d(id, 'hide');
							element.style.height = h2+'px';
						}
					}
				} else {
					element.style.display='none';
				}
			} else if(action=='showHide') {
				if(element.style.display=='none') d(id,'show',slide,speed,fade);
				else d(id,'hide',slide,speed,fade);
			} else if(action=='hideShow') {
				if(element.style.display=='block') d(id,'hide',slide,speed,fade);
				else d(id,'show',slide,speed,fade);
			} else  return element.style.display;
		}
	} else if(ids.length>1) {
		for(var a=0; a<ids.length; a++) {d(ids[a],action,slide,speed,fade)}
	}
}

function store(id,value) {
	if(value) localStorage.setItem(id,value);
	else return localStorage.getItem(id);
}

function option(id) {
	if(store('option:'+id)=='true') return true;
	else return false;
}

function resetOptions() {
	store('volume','60');
	store('loop','none');
	store('shuffle','false');
	store('mute','false');
	store('negativeCurrentTime','false');
	store('search:only',' ');
	
	store('option:theme:bkg','#fff');
	store('option:theme:color','#000');
	
	store('option:offline','false');
	
	store('option:label:songs:artist','true');
	store('option:label:songs:album','true');
	store('option:label:songs:duration','true');
	store('option:label:albums:artist','true');
	store('option:label:albums:songs','true');
	store('option:label:artists:songs','true');
	
	store('option:compactPlayer','false');
	store('option:compactLeftPane','false');
	store('option:useTransforms','false');
	
	store('option:notification:show','true');
	store('option:notification:controls','true');
}

function fileSystemError(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: '+msg);
}

function ajaxcall(url,callback) {
	var call = new XMLHttpRequest();
	call.onreadystatechange=function() {if(call.readyState==4) callback(call.responseText);}
	call.open("GET",url+'#'+Math.random(),true);
	call.send(null);
}

function notify(title,body,required) {
	var not = webkitNotifications.createNotification('',title,body);
	if((store('option:notification:show')=='true') || (required)) {not.show();}
	return not;
}