$( document ).ready(function() {
	firstpage();
	var db;

function firstpage() {
	/*var table="<table id='table'><tr id='trhead'><th id='th'>Note Subject</th><th id='th'>Date created</th></tr></table>";
       		$("#content_note").append(table);*/
	var openRequest = indexedDB.open("notelist",1);

	openRequest.onupgradeneeded = function(e) {
		console.log("Upgrading DB...");
		var thisDB = e.target.result;
		if(!thisDB.objectStoreNames.contains("noteliststore")) {
			thisDB.createObjectStore("noteliststore", { autoIncrement : true });
		}
	}
	openRequest.onsuccess = function() {
		console.log("Open Success!");
		db = openRequest.result;
        renderList();
	}
	openRequest.onerror = function() {
		console.log("Open Error!");
	}
}



document.getElementById('add').addEventListener('click', popup, false);

function popup(){
	document.getElementById('subject').value = '';
	document.getElementById('message').value = '';
	document.getElementById('author').value = '';
	this.style.display = 'none';
	document.getElementById('list-wrapper').style.display = 'none';
	document.getElementById('numnode').style.display = 'none';
	document.getElementById('note').style.display = 'block';
	document.getElementById('ok').style.display='block';
	document.getElementById('update').style.display = 'none';
}
document.getElementById('ok').addEventListener("click",function(){

	document.getElementById('note').style.display='none';
	document.getElementById('add').style.display='inline-block';
	document.getElementById('list-wrapper').style.display='block';
	document.getElementById('numnode').style.display='block';

	//var me=document.getElementById('message').value;
	var subject = magic(document.getElementById('subject').value);
	var author = magic(document.getElementById('author').value);
	var message = magic(document.getElementById('message').value);
			//function to replace tag elements <,>,& to there corresponding HTML codes	
			function magic(input) {
			    input = input.replace(/&/g, '&amp;');
			    input = input.replace(/</g, '&lt;');
			    input = input.replace(/>/g, '&gt;');
			    return input;
			}
	if (!subject.trim() || !message.trim() || !author.trim()) {
       		//empty
    }
    else {
    	addnote(subject,message,author);
    }
});


document.getElementById('cancel').addEventListener("click",function(){
	$('#subject').val('');
	$('#message').val('');
	$('#author').val('');
	document.getElementById('note').style.display='none';
	document.getElementById('add').style.display='inline-block';
	document.getElementById('list-wrapper').style.display='block';
	document.getElementById('numnode').style.display='block';
});

function addnote(t1,t2,t3) {

	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() +"	" 
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	console.log(datetime);
	var transaction = db.transaction(["noteliststore"],"readwrite");
	var store = transaction.objectStore("noteliststore");
	var request = store.add({subject: t1, message: t2, author: t3, datetime: datetime});
	request.onerror = function() {
		console.log("error");
		//console.log("Error",e.target.error.name);
	    //some type of error handler
	}
	request.onsuccess = function() {
	  	console.log("added " + t1);
	   	renderList();
	  	document.getElementById('subject').value = '';
		document.getElementById('message').value = '';
		document.getElementById('author').value = '';
		
	}
}


function renderList(){

	$('#list-wrapper').empty();
//	$('#list-wrapper').html('<table id='table'><tr id='trhead'><th id='th'>Note Subject</th><th id='th'>Date created</th></tr></table>');
	if($('#list-wrapper')){
		$('list-wrapper').html('');
	}
	var table="<table id='table'><tr id='trhead'><th id='th'>Note Subject</th><th id='th'>Date created</th><th id='th'>Message Count</th></tr></table>";
       		$("#list-wrapper").append(table);
	//Count Objects
	var transaction = db.transaction(['noteliststore'], 'readonly');
	var store = transaction.objectStore('noteliststore');
	var countRequest = store.count();
	countRequest.onsuccess = function(){ 
		$('#numnode').empty();

		
		var $n = $('<h3> Number of Notes:  ' + countRequest.result + '</h3>');
		$('#numnode').append($n);
	};

	// // Get all Objects
	var objectStore = db.transaction("noteliststore").objectStore("noteliststore");
	objectStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {	

			var $link = $('<a href="#" data-key="' + cursor.key + '">' + cursor.value.subject + '</a>');
				var datetime = cursor.value.datetime;

				var m=cursor.value.message;

				console.log("m: "+m);
				//var count=(m.split(cursor.value.message).length - 1);
				var count=m.length;
				console.log("count: "+count);
				$link.click(function(){
					//alert('Clicked ' + $(this).attr('data-key'));
					loadTextByKey(parseInt($(this).attr('data-key')));
				});
				var $row = $('<tr>');
				$('row').attr('id', 'tr1');
				var $subjectCell = $('<td></td>').append($link);
				var $dateCell = $('<td>' + datetime + '</td>');
				var $countCell = $('<td>' + count + '</td>');
				$row.append($subjectCell);
				$row.append($dateCell);
				$row.append($countCell);
				$('#list-wrapper table').append($row);
			cursor.continue();
		}
		else {
			//no more entries
		}
	};
}

function loadTextByKey(key){
	$('#notedetail').empty();
	$("#notedetail").css("display", "block");
	$("#add").css("display", "none");
	$("#list-wrapper").css("display", "none");
	$("#numnode").css("display", "none");	
	
	var transaction = db.transaction(['noteliststore'], 'readonly');
	var store = transaction.objectStore('noteliststore');
	var request = store.get(key);
	request.onerror = function(event) {
		// Handle errors!
	};
	request.onsuccess = function(event) {
		// Do something with the request.result!
		var $subject = $('<h2 style="color:black">' + request.result.subject + '</h2>');
		var $message = $('<p style="color:white">' + request.result.message + '</p>');
		var $author = $('<h3 style="color:black">' + request.result.author + '</h3>');
		var $datetime = $('<h4>' + request.result.datetime + '</h4>');
		var $delBtn = $('<button class="ok" id="delbtn">Delete me</button>');
		var $okdetail = $('<button type="button" class="okbtn" id="okdetail">OK</button>');
		var $upbtn = $('<button type="button" class="up" id="okdetail">Update</button>');
		$delBtn.click(function(){
		console.log('Delete ' + key);
		deleteWord(key);
		});
		$okdetail.click(function(){
			
			back();
		});
		$upbtn.click(function(){
			update(key);
		});
		$('#notedetail').append($subject);
		$('#notedetail').append($message);
		$('#notedetail').append($author);
		$('#notedetail').append($datetime);
		$('#notedetail').append($delBtn);
		$('#notedetail').append($okdetail);
		$('#notedetail').append($upbtn);
	};
}
function deleteWord(key) {
		$("#add").css("display", "block");
		$("#list-wrapper").css("display", "block");
		$("#numnode").css("display", "block");
		var transaction = db.transaction(['noteliststore'], 'readwrite');
		var store = transaction.objectStore('noteliststore');
		var request = store.delete(key);
		request.onsuccess = function(evt){
			renderList();
			$('#notedetail').empty();
			$("#notedetail").css("display", "none");
		};
	} 

function update(key) {
		$("#notedetail").css("display", "none");
		$("#note").css("display", "block");
		$("#update").css("display", "block");
		$("#ok").css("display", "none");
		console.log(key);
		var transaction = db.transaction(['noteliststore'], 'readonly');
		var store = transaction.objectStore('noteliststore');
		var request = store.get(key);
		request.onerror = function (event) {
			// Handle errors!
		};
		request.onsuccess = function () {
			var s = request.result.subject;
			var m = request.result.message;
			var a = request.result.author;
			$('#subject').val(s);
			$('#message').val(m);
			$('#author').val(a);
			$('#update').click(function () {
				updateIt(key, s, m, a);
			});
			console.log(key);

		};
}

function updateIt(key, s, m, a) {
	var transaction = db.transaction(['noteliststore'], 'readwrite');
	var store = transaction.objectStore('noteliststore');

	store.openCursor().onsuccess = function (event) {
		var cursor = event.target.result;
		if (cursor) {
			if (cursor.key == key) {

				var datetime = cursor.value.datetime;
				var udata = cursor.value;
				udata.subject = $('#subject').val();
				udata.message = $('#message').val();
				udata.author = $('#author').val();
				udata.datetime = datetime;
				var request1 = cursor.update(udata);
				request1.onerror = function () {
					console.log("error");
				};
				request1.onsuccess = function () {
					//$('#tr1').empty();
					renderList();
					

					document.getElementById('add').style.display = 'block';
					document.getElementById('note').style.display = 'none';
					document.getElementById('list-wrapper').style.display = 'block';
					document.getElementById('numnode').style.display = 'block';
					
					
				};
			}
			cursor.continue();
		}
		else {

		}
	};
} 

function back() {
		//$('#notedetail').empty();
		$("#notedetail").css("display", "none");
		$("#add").css("display", "block");
		$("#list-wrapper").css("display", "block");
		$("#numnode").css("display", "block");
		
	} 



});