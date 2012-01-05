(function() {
// ----------------------------------------------
// Workspace
// ----------------------------------------------

var Workspace;

Workspace = function() {
	if (this instanceof Workspace) {
		var ws = document.getElementById('workspace');
		var cPanel = document.getElementById('controlpanel');
		var btnAddMoar = document.getElementById('btn_add_moar');
		var btnShowHide = document.getElementById('showhide');

		var sb = new Sidebar();

		ws.addEventListener('click', this.wsClicked, false);


		cPanel.addEventListener('click', this.cPanelClicked, false);

		btnShowHide.addEventListener('click', function(e) {
			sb.toggle();
		}, false);

		$(ws).sortable({
			'items' : '.tile',
			'handle' : '.handle',
			'placeholder' : 'tile placeholder',
			'revert' : '140ms',
			'tolerance' : 'pointer',
			'zIndex' : '2000',
		});



	} else {
		return new Workspace();
	}


};

Workspace.prototype = {

	wsClicked: function(e) {
		var el = e.target;
		
		if(el.className === 'btn-close') {
			w.removeNote(el.parentNode.id);
		}
	},

	cPanelClicked: function(e) {
		var el = e.target;
		if(el.id === 'new_note') {
			w.newNote("note");
		}

		if(el.id === 'new_task') {
			w.newNote("task");
		}
	},

	elem: document.getElementById('workspace'),
	
	notes: new Array(),

	newNote: function(typ) {
		var n = new Note(typ);
		var bn = this.elem.lastChild.previousSibling;
		this.notes.push(n);

		n.elem.childNodes[0].style.webkitTransform = n.content.style.tilt();

		this.elem.appendChild(n.elem);
		
		n.elem.childNodes[1].focus();

		$('workspace').sortable('refresh');

	},

	removeNote: function(noteid) {
		for(var c in this.notes) {
			if(this.notes[c].id === noteid) {
				if(this.notes[c].elem.nextSibling) {
					this.notes[c].elem.nextSibling.childNodes[1].focus();
				} else if(this.notes[c].elem.previousSibling && this.notes.length > 1) {
					this.notes[c].elem.previousSibling.childNodes[1].focus();
				}
				this.elem.removeChild(this.notes[c].elem);
				this.notes.splice(c, 1);
				break;
			}
		}
	}
};




































// ----------------------------------------------
// Note
// ----------------------------------------------

var Note = function(typ) {
	if ( this instanceof Note ) {
		this.id = this.setId();
		this.type = (typeof typ === "string") ? typ : 'note';
		this.elem = this.createElement();
	} else {
		return new Note();
	}
	return this;
};


Note.prototype = {

	content: {
		title: "New Note",
		
		body: function(typ) {

			
		},
		
		date: function() {
			return Date.now();
		},

		style: {
			tilt: function() {
				return 'rotate(' + (Math.floor(Math.random() * 30) - 15) + 'deg) scale(0.8)';
			},
			getX: function() {
				return (Math.floor(Math.random() * window.innerWidth) / 2) + 'px';
			},
			getY: function() {
				return (Math.floor(Math.random() * window.innerHeight) / 2) + 'px';
			}
		}
	},

	setContent: function(typ) {

		var b, l;

		
		if(typ === "task") {
			b = document.createElement('ol');
			l = document.createElement('li');
			l.innerText = "Hello, world!";
			b.appendChild(l);
		} else {
			b = document.createElement('div');
			b.innerText = 'Hello, world! \nThis is a note.' + 
				' Please write on me, drag me around, or delete me.';
		}

		b.setAttribute('contenteditable', 'true');
		b.className = "body " + typ;

		return b;
	},
	
	createElement: function() {
		var tileElement = document.createElement('div');
		var bodyContent = this.setContent(this.type);
		var closeButton = document.createElement('div');
		var handle = document.createElement('div');
		tileElement.id = this.id;
		tileElement.className = 'tile';
		closeButton.className = 'btn-close';
		handle.className = 'handle';
		tileElement.appendChild(handle);
		tileElement.appendChild(bodyContent);
		tileElement.appendChild(closeButton);
		return tileElement;
	},
	
	removeElement: function() {
		this.elem.nextSibling.firstChild.focus();
		w.elem.removeChild(this.elem);
	},

	setId: function() {
		return Math.uuid(8);
	},
};











// ----------------------------------------------
// Sidebar
// ----------------------------------------------

var Sidebar = function() {
	if (this instanceof Sidebar) {

		// ----------------------------------------------
		// Tasklist
		// ----------------------------------------------

		var TaskList = function(tasks) {
			if (this instanceof TaskList) {
				for(var c in tasks) {
					this.createTask(tasks[c].id, tasks[c].isChecked, tasks[c].content);
				}
			} else {
				return new TaskList(tasks);
			}
		};

		//Why am I putting this here?
		TaskList.prototype = {

			//Convert this to a function to either get or create the list!
			elem: document.getElementById("sidebar-list"),

			createTask: function(id, checked, content) {
				var liTaskItem = document.createElement("li");
				var divTask = document.createElement("div");
				var divButtons = document.createElement("div");
				var divSortHandle = document.createElement("div");
				var inputChecked = document.createElement("input");
				var divDeleteBtn = document.createElement("div");
				var pTaskText = document.createElement("div");
				
				liTaskItem.className = "list-item";
				liTaskItem.id = id;

				divTask.className = "task";

				divButtons.className = "buttons";
					divDeleteBtn.className = "del";
					divSortHandle.className = "sort-handle";
					
					inputChecked.setAttribute("type", "checkbox");
					inputChecked.setAttribute("checked", checked);
					inputChecked.id = "chk-" + id;

				pTaskText.className = "task-text";
				pTaskText.setAttribute("contenteditable", "true");
				pTaskText.innerHTML = content;

				divButtons.appendChild(divSortHandle);
				divButtons.appendChild(divDeleteBtn);
				divButtons.appendChild(inputChecked);

				divTask.appendChild(divButtons);
				divTask.appendChild(pTaskText);

				liTaskItem.appendChild(divTask);

				this.elem.appendChild(liTaskItem);
			}
		}

		$('.sidebar-list').sortable({
			'axis' : 'y',
			'handle' : '.sort-handle',
			'items' : '.list-item:not(:first-child)',
			'opacity' : '0.5',
			'revert' : '80ms',
			'placeholder' : 'list-item placeholder'
		});

		for(var i = 0; i < 10; i++) {
			this.tasks.push(new Task(Math.uuid(8), true, "Hello World!" + Math.uuid(2)));
		}

		var tl = new TaskList(this.tasks);

	} else {
		return new Sidebar();
	}
};

Sidebar.prototype = {

	elem: document.getElementById('sidebar'),

	tasks: new Array(),

	toggle: function() {
		var c = this.elem.className;
		var i = c.indexOf(" show");
		if (i !== -1) {
			this.elem.className = c.substr(0, i) + c.substr(i + 5);
		} else {
			this.elem.className += " show";
		}
	},

};


















































































// ----------------------------------------------
// Task
// ----------------------------------------------

var Task = function(id, chk, content) {
	if (this instanceof Task) {
		this.id = id;
		this.isChecked = chk;
		this.content = content;
	} else {
		return new Task();
	}
};

Task.prototype = {
	get id() {
		return this._id;
	},
	set id(val) {
		this._id = val;
	},

	get isChecked() {
		return this._checked;
	},

	set isChecked(val) {
		if (typeof val === "boolean") {
			this._checked = val;
		}
	},

	get content() {
		return this._content;
	},

	set content(val) {
		if (typeof val === "string") {
			this._content = val;
		}
	},

	toString: function() {
		return this.id + ', ' + this.isChecked + ', ' + this.content;
	}
}








var w = Workspace();
})();