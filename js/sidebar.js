

// ----------------------------------------------
// Sidebar
// ----------------------------------------------

var Sidebar = function() {
	if (this instanceof Sidebar) {

		var b = document.getElementById('showhide');

		b.addEventListener('click', function(e) {
			sb.toggle();
		}, false);

		$('.sidebar-list').sortable({
			'axis' : 'y',
			'handle' : '.sort-handle',
			'items' : '.list-item:not(:last-child)',
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

var TaskList = function(tasks) {
	if (this instanceof TaskList) {
		for(var c in tasks) {
			this.createTask(tasks[c].id, tasks[c].isChecked, tasks[c].content);
		}
	} else {
		return new TaskList(tasks);
	}
};

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


var sb = new Sidebar();

console.log(sb.tasks);




































