var StickyApp = (function () {'use strict';

    //Constants
    var DEFAULT_APP_TITLE = 'Sticky Notes',
        captured,
        DEFAULT_STARTER_TEXT = 'Welcome! Click the plus button in the upper-right corner to create a new note.',
        DEFAULT_TEXT = 'Hello, world! This is a note.',
        DEFAULT_TITLE = 'Untitled Note',
        isTouchEnabled = window.Touch || false,
        nH,
        nW,
        ordering = [['sorted', 'relative'], ['free', 'absolute']],
        selectedTile,
        sidebar,
        tiles = [],
        toggleView,
        topZ = 0,
        txtSidebarText,
        txtSidebarTitle,
        workspace;

    var Tile = function(args) {
        var self = this, key;
        if (this instanceof Tile) {
            self.tile = document.createElement('div');
            self.tileBody = document.createElement('pre');
            self.closeButton = document.createElement('div');
            self.tileBody.className = 'note';
            self.closeButton.className = 'btn-close';
            self.tile.appendChild(self.tileBody);
            self.tile.appendChild(self.closeButton);
            self.tile.className = 'tile';
            self.position = 'absolute';
            if (args) {
                for (key in args) {
                    if (args.hasOwnProperty(key)) {
                        self[key] = args[key];
                    }
                }
            } else {
                self.id = (Math.uuid(8));
                self.left = Math.round((Math.random() * (window.innerWidth / 2)));
                self.text = DEFAULT_TEXT;
                self.title = DEFAULT_TITLE;
                self.top = Math.round((Math.random() * (window.innerHeight / 2)));
            }
            self.z = ++topZ;
            self.tilt = 15;
            return self;
        } else {
            return new Tile(arguments);
        }
    };

    Tile.prototype = {
        get id() {
            return this._id;
        },

        set id(value) {
            this.tile.id = value;
            this._id = value;
        },

        get title() {
            return this._title;
        },

        set title(value) {
            this._title = value;
        },

        get text() {
            return this._text;
        },

        set text(value) {
            this.tileBody.innerText = value;
            this._text = value;
        },

        get left() {
            return this._left;
        },

        set left(value) {
            this.tile.style.left = value + 'px';
            this._left = value;
        },

        get tilt() {
            return this._tilt;
        },

        set tilt(value) {
            this._tilt = Math.floor(Math.random() * value);
            this._tilt = (Math.floor(Math.random() * 2) === 1) ? -this._tilt : this._tilt;
            this.tile.style.webkitTransform = 'rotate(' + this._tilt + 'deg)';
        },

        get top () {
            return this._top;
        },

        set top(value) {
            this.tile.style.top = value + 'px';
            this._top = value;
        },

        get position() {
            this._position = this.tile.style.position;
            return this._position;
        },

        set position(value) {
            this.tile.style.position = value;
            this._position = value;
        },

        set width(value) {
            this.tile.clientWidth = value;
            this._width = value;
        },

        get width() {
            return this.tile.clientWidth;
        },

        set height(value) {
            this.tile.clientHeight = value;
            this._height = value;
        },

        get height() {
            return this.tile.clientHeight;
        },

        get z() {
            return this._z;
        },

        set z(value) {
            this.tile.style.zIndex = value;
            this._z = value;
        }

    };

    function getTile(el) {
        for (var i = tiles.length - 1; i >= 0; i--) {
            if (tiles[i].tile === el) {
                return tiles[i];
            }
        }
    }

    function saveTiles() {
        var str;
        localStorage.clear();
        for(var i = tiles.length - 1; i >= 0; i--) {
            str = {
                'id' : tiles[i].id,
                'left' : tiles[i].left,
                'text' : tiles[i].text,
                'tilt' : tiles[i].tilt,
                'title' : tiles[i].title,
                'top' : tiles[i].top,
                'z' : tiles[i].z
            };
            localStorage.setItem('ordering', JSON.stringify(ordering));
            localStorage.setItem('tile_' + i, JSON.stringify(str));
        }
    }

    function deselectTile() {
        var s = document.getElementsByClassName('sel'), str;
        for (var i = s.length - 1; i >= 0; i--) {
            s[i].className = 'tile';
        }
        txtSidebarTitle.value = DEFAULT_APP_TITLE;
        txtSidebarTitle.disabled = true;
        txtSidebarText.value = DEFAULT_STARTER_TEXT;
        txtSidebarText.disabled = true;
    }

    function selectTile(el) {
        if (el.className.indexOf('tile') > -1) {
            deselectTile();
            selectedTile = getTile(el);
            nW = workspace.clientWidth - selectedTile.width;
            nH = workspace.clientHeight - selectedTile.height;
            selectedTile.tile.className = 'tile sel';
            selectedTile.z = topZ++;
            txtSidebarText.value = selectedTile.text;
            txtSidebarText.disabled = false;
            txtSidebarTitle.value = selectedTile.title;
            txtSidebarTitle.disabled = false;
            txtSidebarText.focus();
        }
    }

    function setPosition() {
        for (var i = tiles.length - 1; i >= 0; i--) {
            tiles[i].position = ordering[0][1];
            if (ordering[0][0] === 'sorted') {
                tiles[i].tile.style.left = '';
                tiles[i].tile.style.top = '';
                $(workspace).sortable('enable');
            } else {
                tiles[i].left = tiles[i].left;
                tiles[i].top = tiles[i].top;
                $(workspace).sortable('disable');
            }
        }
    }

    function addNewTile (options) {
        selectedTile = new Tile(options);
        tiles.push(selectedTile);
        workspace.appendChild(selectedTile.tile);
        setPosition();
    }

    function removeTile (thisTile) {
        deselectTile();
        if (thisTile.className.indexOf('tile') > -1) {
            workspace.removeChild(thisTile);
            for (var i = tiles.length - 1; i >= 0; i--) {
                if (tiles[i].tile === thisTile) {
                    tiles.splice(i, 1);
                }
            }
            saveTiles();
        }
    }

    function onMouseMove(e) {
        var nX, nY;
        e.preventDefault();
        if (isTouchEnabled) {
            if (selectedTile.left >= 0 && selectedTile.left <= workspace.clientHeight) {
                selectedTile.left = e.touches[0].clientX - this.startY;
            }
            selectedTile.top = e.touches[0].clientY;
        } else {
            nX = e.clientX - selectedTile.startX;
            nY = e.clientY - selectedTile.startY;
            selectedTile.left = (nX >= 0) ? ((nX <= nW) ? nX : nW) : 0;
            selectedTile.top = (nY >= 0) ? ((nY <= nH) ? nY : nH) : 0;
        }
    }

    function onMouseUp(e) {
        window.removeEventListener(isTouchEnabled ? 'touchmove' : 'mousemove', this.mouseMoveHandler, false);
        window.removeEventListener(isTouchEnabled ? 'touchend' : 'mouseup', this.mouseUpHandler, false);
        saveTiles();
    }

    function onMouseDown(e) {
        captured = isTouchEnabled ? e.touches[0].target.parentNode : e.target.parentNode;
        if ((ordering[0][0] === 'free') && (captured.className.indexOf('tile') > -1)) {
            selectTile(captured);
            selectedTile.startX = (isTouchEnabled ? e.touches[0].clientX : e.clientX) - selectedTile.tile.offsetLeft;
            selectedTile.startY = (isTouchEnabled ? e.touches[0].clientY : e.clientY) - selectedTile.tile.offsetTop;
            selectedTile.z = ++topZ;
            if (!(selectedTile.hasOwnProperty('mouseMoveHandler'))) {
                selectedTile.mouseMoveHandler = function(e) { return onMouseMove.apply(selectedTile, arguments); };
                selectedTile.mouseUpHandler = function(e) { return onMouseUp.apply(selectedTile, arguments); };
            }

            if(!window.Touch) {
                e.preventDefault();
                window.addEventListener('mousemove', selectedTile.mouseMoveHandler, false);
                window.addEventListener('mouseup', selectedTile.mouseUpHandler, false);
            } else {
                window.addEventListener('touchend', selectedTile.mouseUpHandler, false);
                window.addEventListener('touchmove', selectedTile.mouseUpHandler, false);
            }
        }
    }
    
    function onKeyUp(e) {
        captured = isTouchEnabled ? e.touches[0].target : e.target;
        var k = e.keyCode;
        if (captured === txtSidebarText && (txtSidebarText.disabled === false)) {
            selectedTile.text = captured.value;
        }

        if (captured === txtSidebarTitle) {
            selectedTile.title = txtSidebarTitle.value;
        }
    }

    function onKeyDown(e) {
        captured = isTouchEnabled ? e.touches[0].target : e.target;
        var k = e.keyCode;
        if (captured === txtSidebarText) {
            switch (k) {
                case 9:
                    e.preventDefault();
                    if (e.shiftKey) {
                        if (selectedTile.tile.previousSibling) {
                            selectTile(selectedTile.tile.previousSibling);
                        } else {
                            selectTile(tiles[tiles.length - 1]);
                        }
                    } else {
                        if (selectedTile.tile.nextSibling) {
                            selectTile(selectedTile.tile.nextSibling);
                        } else {
                            selectTile(tiles[0].tile);
                        }
                    }
                break;
            }
        }
    }

    function onClick(e) {
        captured = isTouchEnabled ? e.touches[0].target : e.target;
        if (captured.className.indexOf('note') !== -1) {
            selectTile(captured.parentNode);
        }

        if (captured.id === 'view') {
            ordering.push(ordering.shift());
            setPosition();
            captured.className = 'button view ' + ordering[1][0];
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

        if (captured === workspace) {
            deselectTile();
        }
    }


    function sortTiles(e, ui) {
        var arr = $(workspace).sortable('toArray'), dummy = [];
        for (var i = arr.length - 1; i >= 0; i--) {
            while (tiles[0].tile.id !== arr[i]) {
                tiles.push(tiles.shift());
            }
            dummy.push(tiles.shift());
        }
        tiles = dummy;
        saveTiles();
    }

    function init() {

        workspace = document.getElementById('workspace');
        sidebar = document.getElementById('sidebar');
        txtSidebarTitle = document.getElementById('title');
        txtSidebarText = document.getElementById('note_text');

        window.addEventListener('click', function (e) { return onClick(e); }, true);
        window.addEventListener(isTouchEnabled ? 'touchstart' : 'mousedown', function(e) { return onMouseDown(e); }, true);

        sidebar.addEventListener('keyup', function (e) { return onKeyUp(e); }, false);
        sidebar.addEventListener('keydown', function (e) { return onKeyDown(e); }, false);

        $(document).ready(function() {
            $(workspace).sortable({
                items: '.tile',
                revert: '140ms',
                tolerance: 'pointer',
                zIndex: '2000',
                stop : function(e, ui) {
                    return sortTiles.apply(this, arguments);
                }
            }).sortable('disable');    
        });
        

        if (localStorage) {
            for(var i = localStorage.length - 1; i >= 0; i--) {
                if (localStorage.hasOwnProperty('tile_' + i)) {
                    addNewTile(JSON.parse(localStorage.getItem('tile_' + i)));
                }
            }
            if (localStorage.hasOwnProperty('ordering')) {
                ordering = JSON.parse(localStorage.getItem('ordering'));
            }
        }

        setPosition();
        deselectTile();
    }

    init();

}());