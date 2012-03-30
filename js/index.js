var timer = [], selected = [], editInputValue = [], nowPlaying;
store('appOpen','true');

var notification = {
	show: function(content,options) {
		if(timer['notification']) clearTimeout(timer['notification']);
		if(content) $('notification').innerHTML = content;	
		$('notification').style.webkitTransform = 'translate(0px,0px)';
		$('notification').style.height = '36px';
		
		if(options) return;
		timer['notification'] = setTimeout(function() {
			if(option('useTransforms')) $('notification').style.webkitTransform = 'translate(0px,36px)';
			else $('notification').style.height = '0px';
		},3000);
	},
	hide: function() {
		if(timer['notification']) clearTimeout(timer['notification']);	
		if(option('useTransforms')) $('notification').style.webkitTransform = 'translate(0px,36px)';
		else $('notification').style.height = '0px';
	}
}

var dialogue = {
	show: function(id,header,headerValue,close) {
		var element = $('dialogue:'+id);
		var headerValueInsert = '';
		if(header) {
			var div = document.createElement('div');
			div.setAttribute('class','header clear');
			if(headerValue!=null) headerValueInsert = '<div class="value">'+headerValue+'</div>';
			if(close) headerValueInsert += '<div class="close" onclick="dialogue.hide(\''+id+'\')">Close</div>';
			div.innerHTML = headerValueInsert;
			
			if(!element.firstChild) element.appendChild(div);
			else if(element.firstChild.className=='header clear') element.firstChild.innerHTML = div.innerHTML;
			else element.insertBefore(div,element.firstChild);
			
		}
		d('dialogue:'+id+',blanket','show');
		$('blanket').style.opacity='0';
		if(element.style.display!='none') {
			element.style.width=element.clientWidth+'px';
			element.style.marginLeft='-'+Math.round(element.clientWidth/2)+'px';
			element.style.marginTop='-'+Math.round(element.clientHeight/2)+'px';
		}
		$('blanket').style.opacity='1';
	},
	hide: function(id) {
		$('blanket').style.opacity = 0;
		d('dialogue:'+id,'hide');
		setTimeout(function() {d('blanket','hide');},500);
	},
	confirm: function(content,yes,yesValue,noValue) {
		if(!yesValue) yesValue = 'OK';
		if(!noValue) noValue = 'Cancel';
		$('dialogue:confirm:footer:yes').value = yesValue;
		$('dialogue:confirm:footer:no').value = noValue;
		$('dialogue:confirm:content').innerHTML = content;
		$('form:confirm').setAttribute('onsubmit',yes+' return false;');
		dialogue.show('confirm');
	},
	notice: function(content) {
		$('dialogue:notice:content').innerHTML=content;
		dialogue('notice');		
	}
}

function assignEventListeners() {	
	document.getElementsByTagName("body")[0].addEventListener('keyup', keypress, false);	
	document.getElementsByTagName("body")[0].addEventListener('contextmenu', function() {return false;}, false);	
	document.getElementsByTagName("body")[0].addEventListener('unload', function() {store('appOpen','false');}, false);	
	document.getElementsByTagName("body")[0].addEventListener('dragover', function(f){f.preventDefault();}, false);
	document.getElementsByTagName("body")[0].addEventListener('drop', songs.add.confirm, false);
	
	$('notification').addEventListener('click', function() {$('optionsPlaylistSelect').style.height = '0px';}, true);
	[].forEach.call(document.querySelectorAll('#leftPane, #content, #header'), function(col) {col.addEventListener('click', function() {options.hide('clearSelected');}, false);});

	$('header').addEventListener('mouseover', function() {
		$('seek').style.bottom = '0px';
		$('seek').style.webkitTransform = 'translate(0px,0px)';
		$('playlist').style.top = '0px';
		$('playlist').style.webkitTransform = 'translate(0px,0px)';
		$('share').style.top = '0px';
		$('share').style.webkitTransform = 'translate(0px,0px)';
	}, false);
	
	$('header').addEventListener('mouseout', function() {
		if(option('useTransforms')) {
			$('seek').style.webkitTransform = 'translate(0px,30px)';
			$('playlist').style.webkitTransform = 'translate(0px,-30px)';
			$('share').style.webkitTransform = 'translate(0px,-30px)';
		} else {
			$('seek').style.bottom = '-30px';
			$('playlist').style.top = '-30px';
			$('share').style.top = '-30px';
		}
	}, false);
	
	$('player:plause').addEventListener('click', function() {player('plause');}, false);
	$('player:previous').addEventListener('click', function() {player('previous');}, false);
	$('player:next').addEventListener('click', function() {player('next');}, false);
	
	$('currentTime').addEventListener('click', function() {
		if(store('negativeCurrentTime')!='false') store('negativeCurrentTime','false');
		else store('negativeCurrentTime','true');
	}, false);
	
	$('loop').addEventListener('click', function() {player('loop');}, false);
	$('shuffle').addEventListener('click', function() {player('shuffle');}, false);
	$('muteOuter').addEventListener('click', function() {player('mute');}, false);
	
	$('seekBar').addEventListener('change', function() {player('seek',this.value);}, false);
	$('volumeBar').addEventListener('change', function() {player('volume',this.value);}, false);
	
	$('drag:play').addEventListener('dragenter', function() {
		this.style.opacity = '1.0';
		this.style.background = '-webkit-linear-gradient(#afa, #6f6)';
	}, false);
	$('drag:play').addEventListener('dragover', function(e) {if(e.preventDefault) e.preventDefault();}, false);
	$('drag:play').addEventListener('dragleave', function() {
		this.style.opacity = '0.8';
		this.style.background = '-webkit-linear-gradient(#cfc, #9f9)';
	}, false);
	$('drag:play').addEventListener('drop', function(e) {item.play();}, false);
	
	$('drag:delete').addEventListener('dragenter', function() {
		this.style.opacity = '1.0';
		this.style.background = '-webkit-linear-gradient(#faa, #f66)';
	}, false);
	$('drag:delete').addEventListener('dragover', function(e) {if(e.preventDefault) e.preventDefault();}, false);
	$('drag:delete').addEventListener('dragleave', function() {
		this.style.opacity = '0.8';
		this.style.background = '-webkit-linear-gradient(#fcc, #f99)';
	}, false);
	$('drag:delete').addEventListener('drop', function(e) {item.Delete.ask();}, false);
}

window.onload = function() {
	document.getElementsByTagName("body")[0].style.backgroundColor = store('option:theme:bkg');
	document.getElementsByTagName("body")[0].style.color = store('option:theme:text');
	
	assignEventListeners();
	
	$('volumeBar').value = store('volume');
	if(store('loop')!='none') $('loop').style.opacity='1';
	if(store('loop')=='one') $('loop').src='/images/one.png';
	if(store('mute')=='true') {
		$('muteOuter').removeAttribute('class');
		$('volumeBar').value = 0;
	}
	if(store('shuffle')=='true') $('shuffle').style.opacity='1';
	if(store('state')=='pause') $('player:plause').firstChild.id='pause';
	
	window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024*100, function(fs) {fileSystem = fs;}, fileSystemError);
	
	load({callback: function() {
		if(store('currentPage')=='options') d('options','show','slide','slow');
		d('playlists','show','slide');
	}});
	
	if(!option('offline')) {
		$('share:twitter').style.display = 'inline';
		$('share:twitter').addEventListener('click', function() {
			if(nowPlaying) window.open('https://twitter.com/share?text=%23NowPlaying '+nowPlaying+'&url=http://goo.gl/kS86a&via=achshar&related=achshar');
		});
	}
}

var index = {
	timeUpdate: function(request,sendResponse) {
		nowPlaying = request.name;
		$('share:twitter').style.opacity = '1';
		$('seekBar').max = parseInt(request.duration);
		$('seekBar').value = request.currentTime;
		$('duration').innerHTML = parseInt(request.duration/60)+':'+parseInt(request.duration%60);
		$('duration').style.opacity = '1';
		if(store('negativeCurrentTime')=='true') request.currentTime = request.duration-request.currentTime;
		$('currentTime').innerHTML = parseInt(request.currentTime/60)+':'+Math.abs(parseInt(request.currentTime%60));
		$('currentTime').style.opacity = '1';
		$('nowPlaying').innerHTML = nowPlaying;
		$('nowPlaying').style.opacity = '1';
		if(store('state')=='pause') $('player:plause').firstChild.id='pause';
	},
	song: {
		change: function() {
			load({preserveSelected:true});
		},
		end: function() {
			nowPlaying = '';
			$('share:twitter').style.opacity = '0.5';
			$('player:plause').firstChild.id='play';
			load({preserveSelected:true});
			$('nowPlaying').style.opacity = '0';
			$('currentTime').style.opacity = '0';
			$('duration').style.opacity = '0';
			$('seekBar').value = '0';
			$('seekBar').max = '0';
		}
	},
	progress: {
		change: function(request) {			
			if(timer['progress']) clearTimeout(timer['progress']);
			$('progressBar').max = request.files.length;
			$('progressBar').value = request.current;
			if(request.text=='Adding') $('progressName').innerText = request.text+' '+request.files[request.current].name;
			else $('progressName').innerText = request.text;
			$('progress').style.display = 'block';
			$('progress').style.opacity = '1';
		},
		end: function() {
			$('progress').style.opacity = '0';
			timer['progress'] = setTimeout(function() {$('progress').style.display = 'none';},500);
		}
	}
}

chrome.extension.onRequest.addListener(function(request,sender,sendResponse) {
	var level = index;
	request.action.split(/\./).forEach(function(prop) {if(prop in level) level = level[prop];});
	if(typeof level==='function') level(request,sendResponse);
});

function keypress(event) {
	if(!selected['ids'] || selected['ids'].length==0 || $('blanket').style.display=='block') return;
	var element = $(selected['what']+':'+selected['ids'][selected['ids'].length-1]);
	
	switch(event.which) {
		case 13:
			item.play();
			break;
		case 46:
			item.Delete.ask();
			break;
		case 38:
			if(element.previousSibling!=null && element.previousSibling.id.substr(0,element.previousSibling.id.indexOf(':'))==selected['what']) select.single(event,element.previousSibling.id);
			break;
		case 40:
			if(element.nextSibling!=null && element.nextSibling.id.substr(0,element.nextSibling.id.indexOf(':'))==selected['what'])	select.single(event,element.nextSibling.id);
			break;
	}
}

function toggleSearchOnly(what) {
	if(what=='change') {
		$('searchHome').lastChild.style.width = '0px';
		$('searchHome').lastChild.style.marginLeft = '0%';
		[].forEach.call(document.querySelectorAll('#searchHome #selected'), function(col) {
			col.setAttribute('class','searchOnly');
			col.setAttribute('id','searchOnly'+store('search:only').charAt(0).toUpperCase() + store('search:only').slice(1));
			col.setAttribute('onclick',"toggleSearchOnly('"+store('search:only').charAt(0).toUpperCase() + store('search:only').slice(1)+"')");
		});
		store('search:only',' ');
		
		var ids = ['Songs','Artists','Albums'];
		for(var i=0; i<ids.length; i++) {
			$('searchOnly'+ids[i]).setAttribute('style','');
			$('searchOnly'+ids[i]).innerHTML=ids[i];
		}
	} else {
		$('searchOnly'+what).removeAttribute('class');
		$('searchOnly'+what).removeAttribute('onclick');
		$('searchOnly'+what).style.width = '78.6%';
		$('searchOnly'+what).innerHTML = 'Searching '+what;
		$('searchOnly'+what).setAttribute('id','selected');
		$('searchHome').lastChild.style.width = '18.6%';
		$('searchHome').lastChild.style.marginLeft = '1%';
		store('search:only',what.toLowerCase());
		
		var ids = ['Songs','Artists','Albums'];
		for(var i=0; i<ids.length; i++) {
			if(ids[i]!=what) {
				$('searchOnly'+ids[i]).style.width='0px';
				$('searchOnly'+ids[i]).style.marginLeft='0px';
				$('searchOnly'+ids[i]).innerHTML='';
			}
		}
	}
	$('searchInput').focus();
}

function player(action,data) {
	switch(action) {
		case 'plause':
			if(store('state')=='play') $('player:plause').firstChild.id='pause';
			else $('player:plause').firstChild.id='play';
			break;
		case 'volume':
			$('volumeCounter').innerHTML = data;
			$('volumeCounter').style.opacity = 1;
			store('volume',data);
			if(timer['volumeCounter']) clearTimeout(timer['volumeCounter']);
			timer['volumeCounter'] = setTimeout("$('volumeCounter').style.opacity = 0", 1000);
			if(store('mute')=='true') {
				player('mute','volumeChange');
				return;
			} else if(data==0) {
				player('mute','volumeChange');
				return;
			}
			break;
		case 'mute':
			if(store('mute')=='true') {
				store('mute','false');
				$('muteOuter').setAttribute('class','muteOuter');
				$('volumeBar').value = store('volume');
			} else {
				store('mute','true');
				$('muteOuter').removeAttribute('class');
				$('volumeBar').value = 0;
			}
			break;
		case 'shuffle':
			if(store('shuffle')=='true') {
				store('shuffle','false');
				$('shuffle').style.opacity='0.5';
			} else {
				store('shuffle','true');
				$('shuffle').style.opacity='1.0';
			}
			return;
		case 'loop':
			if(store('loop')=='one') {
				store('loop','all');
				$('loop').src='../images/all.png';
			} else if(store('loop')=='all') {
				store('loop','none');
				$('loop').src='../images/all.png';
				$('loop').style.opacity='0.5';
			} else {
				store('loop','one');
				$('loop').style.opacity='1.0';
				$('loop').src='../images/one.png';
			}
			return;
	}
	if(data) chrome.extension.sendRequest({action:'player.'+action, data:data});
	else chrome.extension.sendRequest({action:'player.'+action});
}

var select = {
	multiple: function(event,elementId) {
		var what = '', id = '';		
		if(elementId) {
			what = elementId.substr(0,elementId.indexOf(':'));
			id = elementId.substr(elementId.indexOf(':')+1);
		}
		
		if(event.ctrlKey && what==selected['what']) {
			var alreadySelected = false;
			for(var i=0; i<selected['ids'].length; i++) {if(selected['ids'][i]==id) var alreadySelected = i;}
			if((alreadySelected!==false) && (selected['ids'].length>1)) delete selected['ids'].splice(alreadySelected,1);
			else if(selected['ids'][0]!=id) selected['ids'].push(id);
		} else if(event.shiftKey && what==selected['what']) {
			if(selected['ids'].length>0) selected['ids'] = [selected['ids'][0]];
			if(selected['ids'][0]!=id) {
				var selectionStarted = false;
				var element = $('section:'+what+'s').firstChild;
				while(element && element.nodeType===1) {
					if(((element.id.substr(element.id.indexOf(':')+1)==id) || (element.id.substr(element.id.indexOf(':')+1)==selected['ids'][0])) && (!selectionStarted)) {
						selectionStarted = true;
						if(element.id.substr(element.id.indexOf(':')+1)==id) selected['ids'].push(element.id.substr(element.id.indexOf(':')+1));
						element = element.nextSibling;
					} else if(((element.id.substr(element.id.indexOf(':')+1)==id) || (element.id.substr(element.id.indexOf(':')+1)==selected['ids'][0])) && (selectionStarted)) {
						selectionStarted = false;
						if(element.id.substr(element.id.indexOf(':')+1)==id) selected['ids'].push(element.id.substr(element.id.indexOf(':')+1));
						element = undefined;
					} else {
						if(selectionStarted) selected['ids'].push(element.id.substr(element.id.indexOf(':')+1));
						element = element.nextSibling;
					}
				}
			}
		} else if(id) {select.single(event,elementId); return;}
		if(event.stopPropagation) event.stopPropagation();
		if(selected['ids'] && selected['ids'].length>0) options.show(event);
	},
	single: function(event,elementId) {
		var what = '', id = '';
		
		if(elementId) {
			what = elementId.substr(0,elementId.indexOf(':'));
			id = elementId.substr(elementId.indexOf(':')+1);
		}
		
		if(id) {
			selected['ids'] = [];
			selected['ids'].push(id);
			selected['what'] = what;
		}
		event.stopPropagation();
		if(selected['ids'].length>0) options.show(event);
	}
}

var options = {
	hide: function(event) {
		$('optionsPlaylistSelect').style.height = '0px';
		if(event=='clearSelected') selected = [];
		[].forEach.call(document.querySelectorAll('.selected'), function(col) {col.setAttribute('class','item');});
		notification.hide();
	},
	show: function(event) {
		if(timer['notification']) clearTimeout(timer['notification']);
		var element = $('notification');
		function appendDiv(what,id,innerHTML,onclick) {
			var div = document.createElement('div');
			div.setAttribute('id','option:'+id);
			div.setAttribute('class','options'+what);
			if(onclick) div.setAttribute('onclick',onclick);
			div.innerHTML = innerHTML;
			element.appendChild(div);
		}
		var show = {
			others: function(response) {
				appendDiv('Button button','play','Play','item.play()');				
				appendDiv('Button button','delete','Delete',"item.Delete.ask()");
				
				if($('playlists').firstChild.id=='subpage:addPlaylist') appendDiv('Button buttonDisabled','playlist','Playlist');
				else appendDiv('Button button','playlist','Playlist',"item.playlist.show()");
				
				if(store('currentPage')=='playlists' && selected['ids'].length==1) {
					if(($('song:'+selected['ids'][0])!=null) && ($('song:'+selected['ids'][0]).previousSibling) && ($('song:'+selected['ids'][0]).previousSibling.id.substr(0,5)=='song:')) appendDiv('Button button','up','&uArr;',"songs.changePosition('"+$('song:'+selected['ids'][0]).previousSibling.id.substr(5)+"')");
					else  appendDiv('Button buttonDisabled','up','&uArr;');
					
					if(($('song:'+selected['ids'][0])!=null) && ($('song:'+selected['ids'][0]).nextSibling) && ($('song:'+selected['ids'][0]).nextSibling.id.substr(0,5)=='song:')) appendDiv('Button button','down','&dArr;',"songs.changePosition('"+$('song:'+selected['ids'][0]).nextSibling.id.substr(5)+"')");
					else appendDiv('Button buttonDisabled','down','&dArr;');
				}
				
				if(selected['what']=='song') {
					if(selected['ids'].length==1) appendDiv('Info','type','Type: '+response.type);
					else appendDiv('Info','selected','Selected: '+selected['ids'].length);
				}
				
				appendDiv('Info','size','Size: '+response.size+' MB');
				appendDiv('Info','playCount','Play Count: '+response.playCount);
				
				if(selected['ids'].length==1) $('optionsPlaylistSelect').style.left='184px';
				else $('optionsPlaylistSelect').style.left='102px';
				
				$('optionsPlaylistSelect').innerHTML = response.optionsPlaylist;
			},
			playlist: function(response) {
				appendDiv('Button button','play','Play','item.play()');				
				appendDiv('Button button','delete','Delete',"item.Delete.ask()");
				
				if(response.size) appendDiv('Info','size','Size: '+response.size+' MB');
				if(response.playCount) appendDiv('Info','playCount','Play Count: '+response.playCount);
			}
		}
		if(event!='dontHide') {
			notification.hide();
			$('optionsPlaylistSelect').style.height = '0px';
		}
		chrome.extension.sendRequest({action:'item.showOptions', ids:selected['ids'], what:selected['what']}, function(response) {
			$('notification').innerHTML = '';
			if(selected['what']!='playlist') {
				[].forEach.call(document.querySelectorAll('.selected'), function(col) {col.setAttribute('class','item');});
				for(var i=0; i<selected['ids'].length; i++) {
					if(($(selected['what']+':'+selected['ids'][i])!=null) && (($(selected['what']+':'+selected['ids'][i]).className!='item nowPlaying'))) $(selected['what']+':'+selected['ids'][i]).setAttribute('class','item selected');
				}
			}
			if(selected['what']=='playlist') show.playlist(response);
			else show.others(response);
			setTimeout("notification.show(false,true)",200);
		});
	}
}

var item = {
	play: function() {		
		$('player:plause').firstChild.id='pause';
		store('state','pause');
		chrome.extension.sendRequest({action:'item.play', ids:selected['ids'], what:selected['what']});
	},
	playlist: {
		show: function() {
			$('optionsPlaylistSelect').style.height = ($('optionsPlaylistSelect').getElementsByTagName('label').length*25)+1+'px';
		},
		change: function(id) {
			var checkbox = $('playlistCheckbox:'+id);
			var action = 'remove';
			if(checkbox.checked) action = 'add';
			chrome.extension.sendRequest({action:'playlist.item.'+action+'', what:selected['what'], ids:selected['ids'], playlist:id}, function(response) {
				load({preserveSelected:true});
				if(checkbox.checked) checkbox.removeAttribute('checked');
				else checkbox.setAttribute('checked');
			});
		}
	},
	Delete: {
		ask: function() {
			var content = '';
			if(selected['what']=='song') {
				if(selected['ids'].length>1) content = 'You are about to delete '+selected['ids'].length+' songs! There is no going back.';
				else content = 'Delete '+$('song:'+selected['ids'][0]).firstChild.innerHTML+'?';
			} else if(selected['what']=='playlist') content = 'Delete '+$('subpage:'+selected['ids'][0]).innerHTML+'? <div class="NA">Note: Songs stay unharmed!</div>';
			else {
				if(selected['ids'].length>1) content = 'You are about to delete '+selected['ids'].length+' '+selected['what']+'s! There is no going back.';
				else content = 'Delete '+$(selected['what']+':'+selected['ids'][0]).firstChild.innerHTML+'?';
				content += ' <div class="NA">Note: Songs will be deleted along with!</div>';
			}
			dialogue.confirm(content,"item.Delete.confirm();",'Delete','Cancel');
			$('dialogue:confirm:footer:yes').focus();
		},
		confirm: function() {
			dialogue.hide('confirm');
			var i=0;
			deleteItem();
			function deleteItem() {
				if(i==selected['ids'].length) {				
					var content = '';
					var call = load({preserveSelected:true});
					if(selected['what']=='song') {
						if(selected['ids'].length>1) content = selected['ids'].length+' songs';
						else content = $('song:'+selected['ids'][0]).firstChild.innerHTML;
					} else if(selected['what']=='playlist') {
						content = $('subpage:'+selected['ids'][0]).innerHTML;
						call = load({page:'musicExplorer',subPage:'all',preserveSelected:true});
					} else {
						if(selected['ids'].length>1) content = selected['ids'].length+' '+selected['what']+'s';
						else content = $(selected['what']+':'+selected['ids'][0]).firstChild.innerHTML;
					}
					index.progress.end();
					options.hide('clearSelected');
					notification.show(content+' deleted! Too late for goodbye now :(');
					call;
					return;
				}
				var id = selected['what'];
				if(selected['what']=='playlist') id = 'subpage';
				index.progress.change({files:{length:selected['ids'].length}, current:i, text: 'Deleting: '+$(id+':'+selected['ids'][i]).firstChild.innerText});
				chrome.extension.sendRequest({action: 'item.Delete', id: selected['ids'][i], what: selected['what']}, function(response) {
					chrome.extension.sendRequest({action: 'manageEmptyItems'}, function(response) {
						++i;
						deleteItem()
					});
				});
			}
		}
	},
	edit: {
		ask: function() {
			$('dialogue:edit:content').innerHTML = '';
			chrome.extension.sendRequest({action: 'item.edit.details', ids: selected['ids'], what: selected['what']}, function(response) {
				for(var i=0; i<response.value.length; i++) {
					var label = document.createElement('label');
					var input = document.createElement('input');
					var suggest = document.createElement('ul');
					
					label.setAttribute('class','itemEditLabel');
					label.innerHTML = '<span>'+response.label[i]+'</span>';
					
					input.setAttribute('type','text');
					input.setAttribute('id','dialogue:edit:input:'+response.slug[i]);
					input.setAttribute('value',response.value[i]);
					if(selected['what']!='playlist') {
						input.setAttribute('onkeyup', "item.edit.suggest.show('"+response.slug[i]+"')");
						input.setAttribute('onblur', "setTimeout(function() {item.edit.suggest.hide('"+response.slug[i]+"')},250)");
					}
					
					suggest.setAttribute('class','suggest');
					suggest.setAttribute('id','dialogue:edit:content:'+response.slug[i]+':suggest');
					
					label.appendChild(input);
					label.appendChild(suggest);
					$('dialogue:edit:content').appendChild(label);
					editInputValue[response.slug[i]] = response.value[i];
				}
				
				var notice = document.createElement('div');
				notice.setAttribute('class','NA');
				notice.setAttribute('id','editNA');
				notice.innerHTML = 'Note: Empty albums and artists will be deleted upon save!';
				$('dialogue:edit:content').appendChild(notice);
				
				var title = selected['what'].charAt(0).toUpperCase() + selected['what'].slice(1);
				if(selected['ids'].length>1) title += 's';
				dialogue.show('edit',true,'Edit '+title);
			});		
		},
		suggest: {
			show: function(what,select) {
				if($('dialogue:edit:input:'+what).value=='') {item.edit.suggest.hide(what); return;}
				else if(editInputValue[what]==$('dialogue:edit:input:'+what).value) return;
				editInputValue[what] = $('dialogue:edit:input:'+what).value;
				d('editNA','show');
				var table = what;
				if(what=='name') table = selected['what'];
				
				chrome.extension.sendRequest({action: 'item.edit.suggest', what: table, query: editInputValue[what]}, function(response) {
					if(response && !select) {
						$('dialogue:edit:content:'+what+':suggest').innerHTML = response;
						d('dialogue:edit:content:'+what+':suggest','show');
						[].forEach.call(document.querySelectorAll('.itemEditLabel .suggest li'), function(col) {
							col.addEventListener('click', function() {
								$('dialogue:edit:input:'+what).value = this.childNodes[0].nodeValue;
								item.edit.suggest.show(what,true)
							}, false);
						});
					} else item.edit.suggest.hide(what);
				});
			},
			hide: function(what) {d('dialogue:edit:content:'+what+':suggest','hide');}
		},
		confirm: function() {
			var values = [], label = [];
			[].forEach.call(document.querySelectorAll('.itemEditLabel input'), function(col) {
				values.push(col.value);
				label.push(col.id.substr(col.id.lastIndexOf(':')+1));
			});
			chrome.extension.sendRequest({action: 'item.edit.confirm', values:values, label:label, what:selected['what'], ids:selected['ids']}, function(response) {
				dialogue.hide('edit');
				if(selected['what']=='song') {
					if(selected['ids'].length>1) content = selected['ids'].length+' songs';
					else content = $('song:'+selected['ids'][0]).firstChild.innerHTML;
				} else if(selected['what']=='playlist') {
					content = $('subpage:'+selected['ids'][0]).innerHTML;
					playlists.load();
				} else {
					if(selected['ids'].length>1) content = selected['ids'].length+' '+selected['what']+'s';
					else content = $(selected['what']+':'+selected['ids'][0]).firstChild.innerHTML;
				}
				notification.show(content+' updated!');
				options.hide('clearSelected');
				load();
			});
		}
	}
}

var songs = {
	add: {
		ask: function(what) {$('addSongsInput'+what).click();},
		confirm: function(data) {
			index.progress.change({files:{0:'', length:0}, current:0, text:'Wait up, while i do my stuff..!'});
			var files, id=0, added=0;
			if(data=='Files' || data=='Directory') files = $('addSongsInput'+data).files;
			else files = data.dataTransfer.files;
			
			var file = {
				add: function() {
					var uid = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
					for(var i=0; i<25; i++) {uid += possible.charAt(Math.floor(Math.random() * possible.length));}
					
					fileSystem.root.getFile(uid, {create: true}, function(fileEntry) {
						fileEntry.createWriter(function(writer) {
							writer.write(files[id]);
							var reader = new FileReader();
							reader.onloadend = function(e) {
								var artist = '';
								var album = '';
								var id3v1 = this.result.substr(-128);
								if(id3v1.substr(0,3)=='TAG') {
									files[id].artist = id3v1.substr(33, 30).trim();
									files[id].album = id3v1.substr(63, 30).trim();
								}
								files[id].duration = $('audioTemp').duration;
								files[id].blob = $('audioTemp').src
								files[id].uid = uid;
								chrome.extension.sendRequest({action: 'song.add', file:files[id]}, function(response) {++added; file.ignore();});
							};
							reader.onerror = function(e) {file.ignore();};
							reader.readAsBinaryString(files[id]);
						}, fileSystemError);
					}, fileSystemError);
				},
				ignore: function() {
					++id;
					file.check();
				},
				check: function() {
					if(files.length<=id) {
						$('audioTemp').removeEventListener('loadedmetadata', file.add, false);
						$('audioTemp').removeEventListener('error', file.ignore, false);
						index.progress.end();
						
						load();
						var songMultiple = '';
						if(files.length>1) songMultiple = 's';
						notification.show(files.length+' file'+songMultiple+' checked; '+added+' song'+songMultiple+' added!');
						
						$('addSongsInputFiles').value='';
						$('addSongsInputDirectory').value='';
					} else if(files[id].size>524288) {
						index.progress.change({files:files, current:id, text:'Adding'});
						$('audioTemp').src = window.webkitURL.createObjectURL(files[id]);
					} else file.ignore();
				}
			}
			
			$('audioTemp').addEventListener('loadedmetadata', file.add, false);
			$('audioTemp').addEventListener('error', file.ignore, false);
			file.check();
		}
	},
	changePosition: function(id) {
		if($('option:up')) $('option:up').removeAttribute('onclick');
		if($('option:down')) $('option:down').removeAttribute('onclick');
		chrome.extension.sendRequest({action:'song.changePosition', oldPosition:selected['ids'][0], newPosition:id}, function(response) {
			if(option('useTransforms')) animate();
			else {
				var element = $('section:songs').firstChild;
				var songsElapsed = 0;
				while(element) {
					element.style.position = 'absolute';
					element.style.top = songsElapsed*30+'px';
					songsElapsed = songsElapsed+1;
					element = element.nextSibling;
					if(songsElapsed==$('section:songs').getElementsByClassName('item').length) setTimeout(function() {animate()},1);
				}
			}
			function animate() {
				var element = $('section:songs').firstChild;
				var songsElapsed = 0;
				while(element) {
					if(element.id.substr(5)==selected['ids'][0]) {
						if(option('useTransforms')) var songToMove = songsElapsed;
						else {
							$('song:'+id).style.webkitTransition = 'top 250ms';
							$('song:'+id).style.top = songsElapsed*30+'px';
						}
					} else if(element.id.substr(5)==id) {
						if(option('useTransforms')) var whereToMove = songsElapsed;
						else {
							$('song:'+selected['ids'][0]).style.webkitTransition = 'top 250ms';
							$('song:'+selected['ids'][0]).style.top = songsElapsed*30+'px';
						}
					}
					songsElapsed = songsElapsed+1;
					element = element.nextSibling;
				}
				if(option('useTransforms')) {
					$('song:'+id).style.webkitTransform = 'translate(0px,'+(songToMove-whereToMove)*30+'px)';
					$('song:'+selected['ids'][0]).style.webkitTransform = 'translate(0px,'+(whereToMove-songToMove)*30+'px)';
				}
				setTimeout("load({preserveSelected:true});", 250);
			}
		});		
	}
}

var playlists = {
	add: {
		ask: function() {
			dialogue.show('addPlaylist',true,'New Playlist');
			$('newPlaylistName').focus();
		},
		confirm: function() {
			var name = $('newPlaylistName').value;
			dialogue.hide('addPlaylist');
			if(name) {
				chrome.extension.sendRequest({action:'playlist.add', name:name}, function(response) {
					if(response) {
						load();
						notification.show('Playlist added: '+name+'!');
						$('newPlaylistName').value='';
					} else notification.show('Hey! You already have that playlist.. remember??');
				});
			} else notification.show('Booo! Sorry.. can\'t add a playlist that has no name!');
		}
	}
}

function load(args) {
	if(!args) var args = '';
	if(args.page) {
		var page = args.page;
		store('currentPage',page);
	} else var page = store('currentPage');
	if(args.subPage) {
		store('currentSubPage',args.subPage);
		store('currentSubSubPage',' ');
	}
	
	if(page=='search') {
		if(option('useTransforms')) $('searchBar').style.webkitTransform = 'translate(0px,0px)';
		else $('searchBar').style.height = '32px';
		var term = $('searchInput').value;
		if(term=='') term = ' ';
		store('search:term',term);
		$('searchInput').focus();
	} else {
		if(option('useTransforms')) $('searchBar').style.webkitTransform = 'translate(0px,32px)';
		else $('searchBar').style.height = '0px';
	}
	chrome.extension.sendRequest({action:'load'}, function(response) {
		if(page=='options') {
			if(!$('optionsStyle')) {
				var optionsStyle=document.createElement("link");
				optionsStyle.setAttribute("href", '/css/options.css');
				optionsStyle.setAttribute("rel", "stylesheet");
				optionsStyle.setAttribute("type", "text/css");
				optionsStyle.setAttribute("id", 'optionsStyle');
				document.getElementsByTagName("head")[0].appendChild(optionsStyle);
				
				var optionsScript=document.createElement("script");
				optionsScript.setAttribute("src", '/js/options.js');
				optionsScript.setAttribute("type", "text/javascript");
				optionsScript.setAttribute("id", 'optionsScript');
				document.getElementsByTagName("head")[0].appendChild(optionsScript);
			}
		} else {
			if($('optionsScript')) {
				document.getElementsByTagName("head")[0].removeChild($('optionsStyle'));
				document.getElementsByTagName("head")[0].removeChild($('optionsScript'));
			}
		}
		
		$('content').innerHTML = response.content;
		$('playlists').innerHTML = response.playlists;
		
		[].forEach.call(document.querySelectorAll('.pageSelected'), function(col) {col.classList.remove('pageSelected');});
		$('page:'+store('currentPage')).classList.add('pageSelected');
		if(store('currentPage')!='search' && $('subpage:'+store('currentSubPage'))) $('subpage:'+store('currentSubPage')).classList.add('pageSelected');
		
		if(store('currentPage')!='options') {
			var item = document.querySelectorAll('.item');
			var playlists = document.querySelectorAll('.playlist');
			if(args.preserveSelected && selected['ids']) select.multiple('dontHide');
			
			for(var j=0; j<playlists.length; j++) {
				playlists[j].addEventListener('dragenter', function() {if((store('currentPage')!='playlists') || (store('currentSubPage')!=this.id.substr(8))) this.setAttribute('style','background:rgba(128, 64, 0, 0.2)');}, false);
				playlists[j].addEventListener('dragover', function(e) {if(e.preventDefault) e.preventDefault();}, false);
				playlists[j].addEventListener('dragleave', function() {if((store('currentPage')!='playlists') || (store('currentSubPage')!=this.id.substr(8))) this.removeAttribute('style');}, false);
				playlists[j].addEventListener('drop', function(e) {
					var thisId = this.id;
					chrome.extension.sendRequest({action:'playlist.item.add', what:selected['what'], ids:selected['ids'], playlist:thisId.substr(8)}, function(response) {
						if(response.total==1 && response.changed==0) notification.show("Booo! It's already there..");
						else if(response.total==1 && response.changed==1) notification.show($('song:'+selected['ids'][0]).firstChild.innerHTML+' added to '+$(thisId).innerHTML+'!');
						else if(response.changed!=response.total) notification.show(response.changed+' out of '+response.total+' songs added to '+$(thisId).innerHTML+'. Others were already there!');
						else notification.show(response.changed+' songs added to '+$(thisId).innerHTML+'!');
						load();
					});
				}, false);
			};
			
			for(var i=0; i<item.length; i++) {
				item[i].draggable = 'true';
				item[i].addEventListener('dragstart', function(e) {
					document.getElementsByTagName("body")[0].removeEventListener('drop', songs.add.confirm, false);
					if(!selected['ids'] || selected['ids'].length<2) {
						selected['ids'] = [];
						selected['ids'].push(this.id.substr(this.id.indexOf(':')+1));
						selected['what'] = this.id.substr(0,this.id.indexOf(':'));
					}
					notification.hide();
					
					$('drag:play').innerText = 'Play';
					$('drag:delete').innerText = 'Delete';
					
					if(option('useTransforms')) {
						$('drag:play').style.bottom = '0px';
						$('drag:delete').style.bottom = '0px';
						$('drag:play').style.webkitTransform = 'translate(0px,-60px)';
						$('drag:delete').style.webkitTransform = 'translate(0px,-15px)';
					} else {
						$('drag:play').style.bottom = '60px';
						$('drag:delete').style.bottom = '15px';
						$('drag:play').style.webkitTransform = 'translate(0px,0px)';
						$('drag:delete').style.webkitTransform = 'translate(0px,0px)';
					}
					
					e.dataTransfer.effectAllowed = 'move';
				}, false);
				item[i].addEventListener('dragend', function() {
					document.getElementsByTagName("body")[0].addEventListener('drop', songs.add.confirm, false);
					if(timer['dragOptions']) clearTimeout(timer['dragOptions']);
					timer['dragOptions'] = setTimeout("select.multiple('');",3000);
					
					for(var j=0; j<playlists.length; j++) {if((store('currentPage')!='playlists') && (store('currentSubPage')!=playlists[j].id.substr(5))) playlists[j].removeAttribute('style');}
					for(var j=0; j<item.length; j++) {if(item[j].className!='item nowPlaying') item[j].removeAttribute('style');}
					
					if(option('useTransforms')) {
						$('drag:play').style.webkitTransform = 'translate(0px,34px)';
						$('drag:delete').style.webkitTransform = 'translate(0px,34px)';
					} else {
						$('drag:play').style.bottom = '-34px';
						$('drag:delete').style.bottom = '-34px';
					}
					
					setTimeout(function() {
						$('drag:play').innerText = '';
						$('drag:delete').innerText = '';
					}, 250);
					
					$('drag:play').style.opacity = '0.8';
					$('drag:delete').style.opacity = '0.8';
					$('drag:play').style.background = '-webkit-linear-gradient(#cfc, #9f9)';
					$('drag:delete').style.background = '-webkit-linear-gradient(#fcc, #f99);';
				}, false);
				if(store('currentPage')=='playlists') {
					item[i].addEventListener('dragenter', function() {if(this.className!='item nowPlaying') this.setAttribute('style','opacity: 0.5; box-shadow:0px -2px 0px #30F;}');}, false);
					item[i].addEventListener('dragover', function(e) {if(e.preventDefault) e.preventDefault();}, false);
					item[i].addEventListener('dragleave', function() {if(this.className!='item nowPlaying') this.removeAttribute('style');}, false);
					item[i].addEventListener('drop', function(e) {
						if(selected['ids'].length>1) selected['ids'] = [selected['ids'][0]];
						songs.changePosition(this.id.substr(5));
					}, false);
				}
			}
		} else if(store('currentSubPage')=='settings') setTimeout("onloadSettings()",100);
		else if(store('currentSubPage')=='about') $('about').innerText = store('version');
		if(args.callback) args.callback();
	});
}