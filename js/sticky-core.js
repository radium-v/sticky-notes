var StickyApp = (function () {'use strict';

	//Constants
	var DEFAULT_APP_TITLE = 'Sticky Notes';
	var DEFAULT_TEXT = 'Hello, world! This is a note.';
	var DEFAULT_TITLE = 'Untitled Note';
	var STR_DELIMITER = '_µµ_';
	var DEFAULT_STARTER_TEXT = 'Welcome! Click the plus button in the upper-right corner to create a new note.';
	var selectedTile, captured, topZ, ordering, tiles, workspace, sidebar, toggleView;

	topZ = 0;
	ordering = [
		['sorted', 'relative'],
		['free', 'absolute']
	];
	tiles = [];

	function Tile(args) {
		var self = this;
		if (self instanceof Tile) {

			self.tile = document.createElement('li');
			self.tileBody = document.createElement('pre');
			self.closeButton = document.createElement('div');
			self.handle = document.createElement('div');
			self.tile.className = 'tile';
			self.tileBody.className = 'body note';
			self.closeButton.className = 'btn-close';

			if(args) {
				self.id = args['id'];
				self.title = args['title'];
				self.text = args['text'];
				self.left = args['left'];
				self.top = args['top'];
				self.zIndex = ++topZ;
			} else {
				self.id = (Math.uuid(8));
				self.title = DEFAULT_TITLE;
				self.text = DEFAULT_TEXT;
				self.left = Math.round((Math.random() * (window.innerWidth / 2)));
				self.top = Math.round((Math.random() * (window.innerHeight / 2)));
			}
			
			self.tile.appendChild(self.tileBody);
			self.tile.appendChild(self.closeButton);
			self.tile.appendChild(self.handle);
			if (!('mouseDownHandler' in self)) {
				self.mouseDownHandler = function(e) { return self.onMouseDown(e) };
			}
			var mouseDownHandler
			self.tile.addEventListener('mousedown', self.mouseDownHandler, false);
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
		get top () { return this._top; },
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
		get zIndex () { 
			return this._zIndex;
		},
		set zIndex (x) { 
			this.tile.style.zIndex = x; 
			this._zIndex = x;
		},

		onMouseDown : function (e) {
			if (ordering[0][0] === 'free') {
				captured = this;
				this.startX = e.clientX - this.tile.offsetLeft;
				this.startY = e.clientY - this.tile.offsetTop;
				this.zIndex = ++topZ;
				var self = this;
				if (!('mouseMoveHandler' in this)) {
					this.mouseMoveHandler = function(e) { return self.onMouseMove(e) }
					this.mouseUpHandler = function(e) { return self.onMouseUp(e) }
				}
				document.addEventListener('mousemove', this.mouseMoveHandler, false);
				document.addEventListener('mouseup', this.mouseUpHandler, false);
			}
		},

		onMouseMove : function (e) {
			this.left = e.clientX - this.startX;
			this.top = e.clientY - this.startY;
		},

		onMouseUp : function (e) {
			captured = e.target.parentNode;
			document.removeEventListener('mousemove', this.mouseMoveHandler, false);
			document.removeEventListener('mouseup', this.mouseUpHandler, false);
			saveTiles();
		}

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
				'zIndex' : tiles[i].zIndex
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
				selectedTile.zIndex = topZ++;
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

	function onClick(e) {
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

	function onKeyUp(e) {
		captured = e.target;
		var k = e.keyCode;
		if (captured.id === 'note_text') {
			selectedTile.text = captured.value;
		}

		if (captured.id === 'title') {
			selectedTile.title = captured.value;
		}
	}

	function onKeyDown(e) {
		captured = e.target;
		var k = e.keyCode;
		if (captured.id === 'note_text') {
			console.log(k);
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
			for(var j = 0; j < tiles.length; j++) {
				if (tiles[j].tile.id === arr[i]) {
					dummy.push(tiles[j]);
				}
			}
		}

		tiles = dummy;
		saveTiles();

	}

	function init() {
		workspace = document.getElementById('stickies');
		window.addEventListener('click', function (e) { return onClick(e) }, true);

		sidebar = document.getElementById('sidebar');
		sidebar.addEventListener('keyup', function (e) { return onKeyUp(e) }, false);
		sidebar.addEventListener('keydown', function (e) { return onKeyDown(e) }, false);
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
		setPosition();
		deselectTile();
	}

	init();

})();