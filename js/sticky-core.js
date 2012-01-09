var StickyApp = (function () {'use strict';

	//Constants
	var DEFAULT_APP_TITLE = 'Sticky Notes', DEFAULT_TEXT = 'Hello, world! This is a note.', DEFAULT_TITLE = 'Untitled Note', DEFAULT_STARTER_TEXT = 'Welcome! Click the plus button in the upper-right corner to create a new note.', selectedTile, captured, topZ = 0, ordering = [['sorted', 'relative'], ['free', 'absolute']], tiles = [], workspace, sidebar, toggleView;

	var Tile = function (args) {
		var self = this;
		if (self instanceof Tile) {
			self.tile = document.createElement('li');
			self.tile.className = 'tile';
			self.tileBody = document.createElement('pre');
			self.tileBody.className = 'body note';
			self.closeButton = document.createElement('div');
			self.closeButton.className = 'btn-close';
			if (args){
				self.id = args.id;
				self.title = args.title;
				self.text = args.text;
				self.left = args.left;
				self.top = args.top;
				self.z = ++topZ;
			} else {
				self.id = (Math.uuid(8));
				self.title = DEFAULT_TITLE;
				self.text = DEFAULT_TEXT;
				self.left = Math.round((Math.random() * (window.innerWidth / 2)));
				self.top = Math.round((Math.random() * (window.innerHeight / 2)));
			}
			self.tile.appendChild(self.tileBody);
			self.tile.appendChild(self.closeButton);
			self.tile.style.position = 'absolute';
			return self;
		} else {
			return new Tile(arguments);
		}
	}

	Tile.prototype = {
		get id() { return this._id; },
		set id(x) {
			this.tile.id = x;
			this._id = x;
		},
		get title() { return this._title;},
		set title(x) { this._title = x; },
		get text() { return this._text; },
		set text(x) {
			this.tileBody.innerText = x;
			this._text = x;
		},
		get left() { return this._left; },
		set left(x) {
			var val = x + 'px';
			this.tile.style.left = val;
			this._left = x;
		},
		get top () {
			return this._top;
		},

		set top (x) {
			var val = x + 'px';
			this.tile.style.top = val;
			this._top = x;
		},

		get position() {
			this._position = this.tile.style.position;
			return this._position;
		},

		set position(x) {
			this.tile.style.position = x;
			this._position = x;
		},

		get z () { 
			return this._z;
		},

		set z (x) { 
			this.tile.style.zIndex = x; 
			this._z = x;
		}

	}

	window.onMouseDown = function(e) {
		captured = e.target.parentNode;
		if ((ordering[0][0] === 'free') && (captured.className.indexOf('tile') > -1)) {

			var thisTile = getTile(captured);
			thisTile.startX = e.clientX - thisTile.tile.offsetLeft;
			thisTile.startY = e.clientY - thisTile.tile.offsetTop;
			thisTile.z = ++topZ;
			if (!('mouseMoveHandler' in thisTile)) {
				thisTile.mouseMoveHandler = function(e) { return onMouseMove.apply(thisTile, arguments); }
				thisTile.mouseUpHandler = function(e) { return onMouseUp.apply(thisTile, arguments); }
			}

			if(window.Touch) {
				e.preventDefault();
				window.addEventListener('touchmove', thisTile.mouseMoveHandler, true);
				window.addEventListener('touchend', thisTile.mouseUpHandler, true);
			} else {
				window.addEventListener('mousemove', thisTile.mouseMoveHandler, false);
				window.addEventListener('mouseup', thisTile.mouseUpHandler, false);
			}
		}
	}

	window.onMouseMove = function(e) {
		var self = this;

		console.log(e);

		self.left = e.clientX - self.startX;
		self.top = e.clientY - self.startY;
		console.log(e.clientX);
	}

	window.onMouseUp = function(e) {
		window.removeEventListener('mousemove', this.mouseMoveHandler, false);
		window.removeEventListener('touchmove', this.mouseMoveHandler, false);
		window.removeEventListener('mouseup', this.mouseUpHandler, false);
		window.removeEventListener('touchend', this.mouseUpHandler, false);
		saveTiles();
	}

	function saveTiles() {
		var str;
		localStorage.clear();
		for(var i = 0; i < tiles.length; i++) {
			str = {
				'id' : tiles[i].id,
				'title' : tiles[i].title,
				'text' : tiles[i].text,
				'left' : tiles[i].left,
				'top' : tiles[i].top,
				'z' : tiles[i].z
			};
			localStorage.setItem('ordering', JSON.stringify(ordering));
			localStorage.setItem('tile_' + i, JSON.stringify(str));
		}
	}

	function selectTile(el) {

		if(el.className.indexOf('tile') > -1) {
			selectedTile = getTile(el);
			deselectTile();
			var txtSidebarText = document.getElementById('note_text');
			txtSidebarText.value = selectedTile.text;
			var txtSidebarTitle = document.getElementById('title');
			txtSidebarTitle.value = selectedTile.title;
			if(selectedTile.tile.className.indexOf('sel') === -1) {
				selectedTile.tile.className += ' sel';
				selectedTile.z = topZ++;
			}
			txtSidebarText.focus();
		}
	}

	function deselectTile() {
		var s = document.getElementsByClassName('sel');
		var str;
		for(var i = 0; i < s.length; i++) {
			str = s[i].className;
			s[i].className = str.substring(0, str.indexOf('sel')) + str.substring(str.indexOf('sel') + 3);
		}

		document.getElementById('title').value = DEFAULT_APP_TITLE;
		document.getElementById('note_text').value = DEFAULT_STARTER_TEXT;
	}

	window.onClick = function(e) {
		captured = e.target;
		if (captured.className.indexOf('body') > -1) {
			selectTile(captured.parentNode);
		}

		if (captured.id === 'view') {
			ordering.push(ordering.shift());
			setPosition();
			captured.className = ordering[1][0];
			saveTiles();
		}

		if (captured.className === 'btn-close') {
			removeTile(captured.parentNode);
			saveTiles();
		}
		
		if (captured.id === 'new_note') {
			addNewTile();
			saveTiles();
		}
		
		if (captured.id === 'note_save') {
			saveTiles();
		}

		if (captured.id === 'container') {
			deselectTile();
		}
	}

	window.onKeyUp = function(e) {
		captured = e.target;
		var k = e.keyCode;
		if (captured.id === 'note_text') {
			selectedTile.text = captured.value;
		}

		if (captured.id === 'title') {
			selectedTile.title = captured.value;
		}
	}

	window.onKeyDown = function(e) {
		captured = e.target;
		var k = e.keyCode;
		if (captured.id === 'note_text') {
			switch (k) {
				case 9:
					e.preventDefault();
					if (e.shiftKey) {
						(selectedTile.tile.previousSibling) ? selectTile(selectedTile.tile.previousSibling) : selectTile(tiles[tiles.length - 1].tile);
					} else {
						(selectedTile.tile.nextSibling) ? selectTile(selectedTile.tile.nextSibling) : selectTile(tiles[0].tile);
					}
			}
		}
	}

	function addNewTile (options) {
		tiles.push(new Tile(options));
		selectTile(tiles[tiles.length - 1].tile);
		workspace.appendChild(tiles[tiles.length - 1].tile);
		setPosition();
		return tiles[tiles.length - 1];
	}

	function removeTile (thisTile) {
		deselectTile();
		if (thisTile.className.indexOf('tile') > -1) {
			workspace.removeChild(thisTile);
			for (var i = 0; i < tiles.length; i++) {
				if (tiles[i].tile === thisTile) {
					tiles.splice(i, 1);
				}
			}
			saveTiles();
		}
	}

	function setPosition() {
		for (var i = 0; i < tiles.length; i++) {
			tiles[i].position = ordering[0][1];
			if (ordering[0][0] === 'sorted') {
				tiles[i].tile.style.left = 'inherit';
				tiles[i].tile.style.top = 'inherit';
				$(workspace).sortable('enable');
			} else {
				tiles[i].left = tiles[i].left;
				tiles[i].top = tiles[i].top;
				$(workspace).sortable('disable');
			}
		}
	}

	function getTile(el) {
		for (var i in tiles) {
			if (el === tiles[i].tile) {
				return tiles[i];
			}
		}
	}

	function sortTiles(e, ui) {
		var arr = $(workspace).sortable('toArray');
		var dummy = new Array();
		for(var i = 0; i < arr.length; i++) {
			while (tiles[0].tile.id !== arr[i]) {
				tiles.push(tiles.shift());
			}
			dummy.push(tiles.shift());
		}
		tiles = dummy;
		saveTiles();

	}

	function init() {
		workspace = document.getElementById('stickies');
		window.addEventListener('click', function (e) { return window.onClick(e) }, true);
		window.addEventListener('mousedown', function (e) { return window.onMouseDown(e) }, true);

		sidebar = document.getElementById('sidebar');
		sidebar.addEventListener('keyup', function (e) { return window.onKeyUp(e) }, false);
		sidebar.addEventListener('keydown', function (e) { return window.onKeyDown(e) }, false);
		$(workspace).sortable({
			'items': '.tile',
			'placeholder': 'placeholder',
			'revert': '140ms',
			'tolerance': 'pointer',
			'zIndex': '2000',
			stop : function(e, ui) { return sortTiles.apply(this, arguments); } }).sortable('disable');
		toggleView = document.getElementById('view');
		toggleView.addEventListener('click', function(e) {return onClick(e) }, false);

		if (localStorage) {
			for(var i = 0; i < localStorage.length; i++) {
				if ('tile_' + i in localStorage) {
					addNewTile(JSON.parse(localStorage.getItem('tile_' + i)));
				}
			}
			if ('ordering' in localStorage) {
				ordering = JSON.parse(localStorage.getItem('ordering'));
			}
		}

		if (window.Touch) {
			console.log('touch enabled!');
			window.addEventListener('touchend', function(e) { return window.onClick(e) }, true);
			window.addEventListener('touchstart', function(e) { return window.onMouseDown(e) }, true);
		}
		setPosition();
		deselectTile();
	}

	init();

})();