var App = (function () {
    var tiles = [],
        appForm = document.forms[0],
        currentTile,
        splash = document.getElementById('splash'),
        topZ = 0,
        workspace = document.getElementById('workspace'),
        DEFAULT_TITLE_PLACEHOLDER = 'Untitled Note',
        DEFAULT_TEXT_PLACEHOLDER = 'Click the + button to create a new note.',

        trash = {
            el: (function () {
                return document.getElementById('trash');
            }()),
            playSound: function () {
                var snd = document.getElementById('trash_sound');
                snd.play();
            },
            open: function () { this.el.className = 'button trash open'; },
            close: function () { this.el.className = 'button trash closed'; }
        },

        sidebar = {
            el: (function () {
                return document.getElementById('sidebar');
            }()),

            colorpicker: {
                el: (function () {
                    return document.getElementById('colorpicker');
                }()),
                setColor: function (el) {
                    this.clearSelection();
                    if (typeof el !== 'undefined') {
                        tiles[currentTile].color(window.getComputedStyle(el).backgroundColor);
                        el.className += ' sel';
                    }
                },
                clearSelection: function () {
                    var cbox = document.getElementsByClassName('color-box'), cArr,str;
                    for (var i = cbox.length - 1; i >= 0; i--) {
                        cArr = cbox[i].className.split(' ');
                        str = '';
                        for (var j = cArr.length - 1; j >= 0; j--) {
                            if (cArr[j].indexOf('sel') === -1) {
                                str += cArr[j] + ' ';
                            }
                        }
                        cbox[i].className = str.trim();
                    }
                },
                getColorFromTile: function (tile) {
                    var cArr = this.el.childNodes;
                    var nColor;
                    for (var i = cArr.length - 1; i >= 0; i--) {
                        nColor = window.getComputedStyle(cArr[i]).backgroundColor;
                        if (tile.color() === nColor) {
                            sidebar.colorpicker.setColor(cArr[i]);
                        }
                    }
                },
                onClick: function (e) {
                    var captured = e.target;
                    if (captured.className.indexOf('color-box') > -1) {
                        sidebar.colorpicker.setColor(captured);
                        window.setTimeout(saveNotes, 100, false);
                    }
                }
            },

            clear: function () {
                for (var i = appForm.elements.length - 1; i >= 0; i--) {
                    appForm.elements[i].value = '';
                    appForm.elements[i].disabled = true;
                    appForm.elements[i].blur();
                }
                appForm.elements['title'].setAttribute('placeholder', '');
                appForm.elements['textbox'].setAttribute('placeholder', DEFAULT_TEXT_PLACEHOLDER);
            },

            onClick: function (e) {
                return (function () {
                    var captured = e.target;
                    if (captured.id === 'new_note') {
                        createNewTile();
                        saveNotes();
                    }
                })(e);
            },

            onKeyDown: function (e) {
                var captured = e.target;
                var k = e.keyCode;
                if (k === 9) {
                    if (captured === appForm.elements['textbox'] &&
                        !e.shiftKey) {
                        e.preventDefault();
                        deselectTileElements();
                        selectTileElement(tiles[currentTile < tiles.length - 1 ? currentTile + 1 : 0]);
                    } else if (captured === appForm.elements['titlebox'] &&
                        e.shiftKey) {
                        e.preventDefault();
                        deselectTileElements();
                        selectTileElement(tiles[currentTile > 0 ? currentTile - 1 : tiles.length - 1]);
                        appForm.elements['textbox'].focus();
                    }
                }
            },

            onKeyUp: function (e) {
                var captured = e.target,
                    k = e.keyCode;
                if (k !== 9) {
                    if (captured === appForm.elements['titlebox']) {
                        tiles[currentTile].titleElement.innerText = captured.value;
                    }
                    if (captured === appForm.elements['textbox']) {
                        tiles[currentTile].bodyElement.innerText = captured.value;
                    }
                }
            }
        },

        onClick = function (e) {
            var captured, classArray;
            captured = getTile(e.target, 'tile') || e.target;
            if (captured === workspace || captured === sidebar) {
                deselectTileElements();
                sidebar.clear();
                saveNotes();
            }

            if (captured.className) {
                if (captured.className.indexOf('splash') > -1) {
                    workspace.parentNode.removeChild(splash);
                }
            }
        },

        onMouseMove = function (e) {
            /* this context: captured.tileElement */
            var nX, nY, el;
            el = this.tileElement;
            nX = e.clientX - el.startX;
            nY = e.clientY - el.startY;
            this.setPos((((nX > 0) ? ((nX < nW) ? nX : nW) : 0)), (((nY > 0) ? ((nY < nH) ? nY : nH) : 0)));
            /* I don't recommend using lines this long, but eh */
            if ((el.offsetLeft <= trash.el.offsetLeft && (el.offsetTop + el.clientHeight) >= (workspace.clientHeight - trash.el.clientHeight)) || (e.clientX <= (trash.el.offsetLeft + trash.el.clientWidth) && e.clientY >= trash.el.offsetTop)) {
                el.style.webkitAnimation = 'shrink 0.24s linear forwards';
                el.style.MozAnimation = 'shrink 0.24s linear forwards';
                el.style.animation = 'shrink 0.24s linear forwards';
                trash.open();
            } else {
                el.style.webkitAnimation = '';
                el.style.MozAnimation = '';
                el.style.animation = '';
                trash.close();
            }
        },

        onMouseUp = function (e) {
            /* this context: captured.tileElement */
            var el = this.tileElement;
            if ((el.offsetLeft <= trash.el.offsetLeft && (el.offsetTop + el.clientHeight) >= (workspace.clientHeight - trash.el.clientHeight)) || (e.clientX <= (trash.el.offsetLeft + trash.el.clientWidth) && e.clientY >= trash.offsetTop)) {
                removeTile(this.tileElement);
            }
            workspace.removeEventListener('mousemove', el.mouseMoveHandler, true);
            workspace.removeEventListener('mouseup', el.mouseUpHandler, true);
            saveNotes();
        },

        onMouseDown = function (e) {
            var captured = getTile(e.target, 'tile') || e.target;
            if (captured.hasOwnProperty('tileElement')) {
                e.preventDefault();
                deselectTileElements();
                selectTileElement(captured);
                captured.tileElement.startX = e.clientX - captured.tileElement.offsetLeft;
                captured.tileElement.startY = e.clientY - captured.tileElement.offsetTop;
                nW = workspace.clientWidth - captured.tileElement.clientWidth;
                nH = workspace.clientHeight - captured.tileElement.clientHeight;
                if (!captured.tileElement.hasOwnProperty('mouseMoveHandler')) {
                    captured.tileElement.mouseMoveHandler = function (e) {
                        return onMouseMove.apply(captured, arguments);
                    };
                    captured.tileElement.mouseUpHandler = function (e) {
                        return onMouseUp.apply(captured, arguments);
                    };
                }
                workspace.addEventListener('mousemove', captured.tileElement.mouseMoveHandler, true);
                workspace.addEventListener('mouseup', captured.tileElement.mouseUpHandler, true);
            } else if (captured === workspace || captured === sidebar) {
                deselectTileElements();
                sidebar.clear();
            }
        },

        selectTileElement = function (el) {
            if (el.hasOwnProperty('tileElement')) {
                getTile(el.tileElement, 'tile');
                el.tileElement.className = 'tile sel';
                sidebar.el.style.display = 'block';
                el.tileElement.z = ++topZ;
                appForm.elements['title'].value = el.titleElement.innerText;
                appForm.elements['title'].setAttribute('placeholder', DEFAULT_TITLE_PLACEHOLDER);
                appForm.elements['textbox'].value = el.bodyElement.innerText;
                appForm.elements['textbox'].setAttribute('placeholder','');
                for (var i = appForm.elements.length - 1; i >= 0; i--) {
                    appForm.elements[i].disabled = false;
                }
                sidebar.colorpicker.getColorFromTile(el);
                appForm.elements['due_date'].value = !(typeof el.date === 'undefined') ? el.date : '';
                appForm.elements['title'].focus();
            }
        },

        deselectTileElements = function (el) {
            var classArray, newClass;
            for (var i in tiles) {
                if (tiles[i].hasOwnProperty('tileElement')) {
                    classArray = tiles[i].tileElement.className.split(' ');
                    newClass = '';
                    for (var j = classArray.length - 1; j >= 0; j--) {
                        newClass += (classArray[j] !== 'sel') ? classArray[j] : '';
                    }
                    tiles[i].tileElement.className = newClass;
                }
            }
            sidebar.colorpicker.clearSelection();
        },

        Tile = function (args) {
            if (this instanceof Tile) {
                var tileElement;
                this.color = function(c) {
                    if (!(typeof c === 'undefined')) {
                        this.note.style.backgroundColor = c;
                        return c;
                    } else {
                        return window.getComputedStyle(this.note).backgroundColor;
                    }
                };
                this.setPos = function (x, y) {
                    this.tileElement.style.left = x + 'px';
                    this.left = x;
                    this.tileElement.style.top = y + 'px';
                    this.top = y;
                };
                /* Create the tile and place it in the workspace */
                this.tileElement = document.createElement('div');
                this.tileElement.className = 'tile';
                workspace.appendChild(this.tileElement);
                /* Create the note div and place it in the tile */
                this.note = document.createElement('div');
                this.note.className = 'note';
                this.tileElement.appendChild(this.note);
                /* Create the title div and place it in the note */
                this.titleElement = document.createElement('div');
                this.titleElement.className = 'title';
                this.note.appendChild(this.titleElement);

                /* Create the delete button in the div*/
                var deleteButton = document.createElement('div');
                deleteButton.className = 'close-splash';
                deleteButton.id = 'deleteButton';

                this.note.appendChild(deleteButton);


                /* Create the pre for the note */
                this.bodyElement = document.createElement('pre');
                this.bodyElement.className = 'body';
                this.note.appendChild(this.bodyElement);
                if (args) {
                    for (key in args) {
                        if (args.hasOwnProperty(key)) {
                            if (key === 'color') {
                                this.color(args[key]);
                            } else {
                                this[key] = args[key];
                            }
                        }
                    }
                } else {
                    this.id = Math.uuid(8);
                    this.title = '';
                    this.text = '';
                    this.left = Math.round((Math.random() *
                        (workspace.clientWidth -
                            this.tileElement.clientWidth)));
                    this.top = Math.round((Math.random() * 
                        (workspace.clientHeight - 
                            this.tileElement.clientHeight)));
                }
                this.tilt = Math.floor(Math.random() * 8);
                this.tilt = (Math.floor(Math.random() * 2) === 1) ? -this.tilt : this.tilt;
                this.tileElement.style.webkitTransform = 'rotate(' + this.tilt + 'deg)';
                //Populate the tile data
                this.tileElement.id = this.id;
                this.tileElement.style.position = 'absolute';
                this.tileElement.style.left = this.left + 'px';
                this.tileElement.style.top = this.top + 'px';
                this.tileElement.style.zIndex = this.z;
                this.titleElement.innerText = this.title;
                this.bodyElement.innerText = this.text;
            } else {
                return new Tile();
            }
        },

        getTile = function (node, value) {
            var result,
                walk = function step(node, func) {
                    func(node);
                    node = node.parentNode;
                    while(node) {
                        step(node, func);
                        node = node.parentNode;
                    }
                };
            walk(node, function (node) {
                var actual = node.nodeType === 1 && node.className;
                if (typeof actual === 'string' && (actual.indexOf(value) > -1 || typeof value !== 'string')) {
                    result = node;
                }
            });
            for (var i = tiles.length - 1; i >= 0; i--) {
                if (tiles[i].tileElement === result) {
                    currentTile = i;
                    return tiles[i];
                }
            }
            return false;
        },

        createNewTile = function (options) {
            var newTile;
            deselectTileElements();
            newTile = new Tile(options);
            tiles.push(newTile);
            selectTileElement(newTile);
        },
            
        removeTile = function (el) {
            /* this: captured.tileElement */
            var captured = getTile(el, 'tile');
            if (captured.hasOwnProperty('tileElement')) {
                tiles.splice(tiles.indexOf(captured), 1);
                sidebar.clear();
                workspace.removeChild(captured.tileElement);
                trash.playSound();
                trash.close();
            }
        },

        saveNotes = function () {
            var str;
            localStorage.clear();
            for (var i = 0; i < tiles.length; i++) {
                str = {
                    'id'    : tiles[i].id,
                    'title' : tiles[i].titleElement.innerText,
                    'text'  : tiles[i].bodyElement.innerText,
                    'color' : tiles[i].color(),
                    'left'  : tiles[i].left,
                    'top'   : tiles[i].top,
                    'z'     : tiles[i].z,
                    'date'  : tiles[i].date
                }
                localStorage.setItem('tile_' + i, JSON.stringify(str));
            }
        },

        loadNotes = function () {
            if (localStorage.length > 0) {
                workspace.parentNode.removeChild(splash);
                for(var i = 0; i < localStorage.length; i++) {
                    if (localStorage.hasOwnProperty('tile_' + i)) {
                        createNewTile(
                            JSON.parse(localStorage.getItem('tile_' + i))
                        );
                    }
                }
            } else {
                splash.style.display = 'block';
                splash.childNodes[1].style.left = (window.innerWidth - splash.childNodes[1].clientWidth) / 2 + 'px';
                splash.childNodes[1].style.top = (window.innerHeight - splash.childNodes[1].clientHeight) / 2 + 'px';
            }
        },

        init = function () {
            workspace.hMouseDown = function (e) { return onMouseDown(e); };
            window.hClick = function (e) { return onClick(e); };
            window.addEventListener('click', window.hClick, false);
            workspace.addEventListener('mousedown', workspace.hMouseDown, true);
            sidebar.el.addEventListener('click', sidebar.onClick, true);
            sidebar.el.addEventListener('keydown', sidebar.onKeyDown, true);
            sidebar.el.addEventListener('keyup', sidebar.onKeyUp, false);
            sidebar.colorpicker.el.addEventListener('click', sidebar.colorpicker.onClick, true);
            loadNotes();
            $('#due_date').datepicker({
                dateFormat: 'yy-mm-dd',
                minDate: new Date(),
                onSelect: function(dateText) {
                    tiles[currentTile].date = dateText;
                    saveNotes();
                }
            });
        };

        $('#deleteButton').live('click', function (e) {
            var captured = getTile(e.target, 'tile') || e.target;
            removeTile(e.target);
            return false;
        });

    init();
}());