/* ===========================================================
   DSA VISUALIZER PRO — script.js
   Vanilla JS. No frameworks.
   Structure:
     1. Theme
     2. Hero canvas animation
     3. Catalog (hierarchical nav data)
     4. Router / navigation
     5. Console (operation log, state, complexity)
     6. Visualizer module registry
     7. Individual module implementations
     8. Complexity analyzer
=========================================================== */

(function () {
  'use strict';

  /* =========================================================
     1. THEME
  ========================================================= */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    localStorage.setItem('dsa-theme', mode);
  }

  (function initTheme() {
    const saved = localStorage.getItem('dsa-theme');
    if (saved) { setTheme(saved); return; }
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(prefersLight ? 'light' : 'dark');
  })();

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* =========================================================
     2. HERO CANVAS — floating nodes + ambient connecting lines
  ========================================================= */
  (function heroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [];
    const NODE_COUNT = 26;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * devicePixelRatio;
      h = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        r: (Math.random() * 2 + 1.5) * devicePixelRatio
      }));
    }

    function isLight() { return root.getAttribute('data-theme') === 'light'; }

    function step() {
      ctx.clearRect(0, 0, w, h);
      const lineColor = isLight() ? 'rgba(13,148,136,0.14)' : 'rgba(45,212,191,0.16)';
      const nodeColor = isLight() ? 'rgba(13,148,136,0.55)' : 'rgba(45,212,191,0.7)';

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160 * devicePixelRatio;
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = 1 - dist / maxDist;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = nodeColor;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(step);
    }

    resize();
    initNodes();
    requestAnimationFrame(step);
    window.addEventListener('resize', () => { resize(); initNodes(); });
  })();

  /* =========================================================
     3. CATALOG — hierarchical nav data
  ========================================================= */
  const CATALOG = {
    linear: {
      title: 'Linear Data Structures',
      sub: 'Structures where elements sit in a sequence, one after another.',
      children: {
        array: { title: 'Array', desc: 'Fixed-shape, index-addressed contiguous storage.', module: 'array' },
        linkedlist: {
          title: 'Linked List', desc: 'Nodes linked by pointers instead of position.',
          children: {
            singly: { title: 'Singly Linked List', desc: 'Each node points to the next only.', module: 'singlyLinkedList' },
            doubly: { title: 'Doubly Linked List', desc: 'Each node points both forward and backward.', module: 'doublyLinkedList' },
            circular: { title: 'Circular Linked List', desc: 'The tail points back to the head.', module: 'circularLinkedList' }
          }
        },
        stack: { title: 'Stack', desc: 'Last in, first out.', module: 'stack' },
        queue: {
          title: 'Queue', desc: 'First in, first out — and its variants.',
          children: {
            simple: { title: 'Simple Queue', desc: 'Classic FIFO queue.', module: 'simpleQueue' },
            circular: { title: 'Circular Queue', desc: 'Fixed buffer that wraps around.', module: 'circularQueue' },
            priority: { title: 'Priority Queue', desc: 'Highest priority leaves first.', module: 'priorityQueue' },
            deque: { title: 'Deque', desc: 'Insert and remove from both ends.', module: 'deque' }
          }
        },
        hashtable: { title: 'Hash Table', desc: 'Key-to-bucket mapping via a hash function.', module: 'hashTable' }
      }
    },
    nonlinear: {
      title: 'Non-Linear Data Structures',
      sub: 'Branching structures built for hierarchy and relationships.',
      children: {
        binarytree: { title: 'Binary Tree', desc: 'Each node has at most two children.', module: 'binaryTree' },
        bst: { title: 'Binary Search Tree', desc: 'Ordered binary tree: left < node < right.', module: 'bst' },
        avl: { title: 'AVL Tree', desc: 'Self-balancing BST via rotations.', module: 'avl' },
        heap: {
          title: 'Heap', desc: 'Complete binary tree maintaining min/max order.',
          children: {
            min: { title: 'Min Heap', desc: 'Smallest element always at the root.', module: 'minHeap' },
            max: { title: 'Max Heap', desc: 'Largest element always at the root.', module: 'maxHeap' }
          }
        },
        trie: { title: 'Trie', desc: 'Prefix tree for fast string lookups.', module: 'trie' },
        graph: { title: 'Graph', desc: 'Vertices connected by edges — BFS &amp; DFS.', module: 'graph' }
      }
    },
    algorithms: {
      title: 'Algorithms',
      sub: 'Step-by-step procedures, animated comparison by comparison.',
      children: {
        sorting: {
          title: 'Sorting Algorithms', desc: 'Reorder a sequence — watch every comparison and swap.',
          children: {
            bubble: { title: 'Bubble Sort', desc: 'Repeatedly swap adjacent out-of-order pairs.', module: 'bubbleSort' },
            selection: { title: 'Selection Sort', desc: 'Repeatedly select the minimum remaining element.', module: 'selectionSort' },
            insertion: { title: 'Insertion Sort', desc: 'Build a sorted prefix one element at a time.', module: 'insertionSort' },
            merge: { title: 'Merge Sort', desc: 'Divide, sort halves, then merge.', module: 'mergeSort' },
            quick: { title: 'Quick Sort', desc: 'Partition around a pivot, recursively.', module: 'quickSort' },
            heap: { title: 'Heap Sort', desc: 'Build a heap, repeatedly extract the max.', module: 'heapSort' }
          }
        },
        searching: {
          title: 'Searching Algorithms', desc: 'Locate a target value within a sequence.',
          children: {
            linear: { title: 'Linear Search', desc: 'Check every element in order.', module: 'linearSearch' },
            binary: { title: 'Binary Search', desc: 'Halve the search space each step.', module: 'binarySearch' }
          }
        }
      }
    }
  };

  /* =========================================================
     4. ROUTER / NAVIGATION
  ========================================================= */
  const views = {
    home: document.getElementById('view-home'),
    category: document.getElementById('view-category'),
    subchild: document.getElementById('view-subchild'),
    visualizer: document.getElementById('view-visualizer'),
    complexity: document.getElementById('view-complexity')
  };

  const breadcrumbEl = document.getElementById('breadcrumb');

  // navigation state stack: array of {key, node, level}
  let navStack = [];

  function showView(name) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderBreadcrumb() {
    breadcrumbEl.innerHTML = '';
    const homeCrumb = document.createElement('span');
    homeCrumb.className = 'crumb is-link';
    homeCrumb.textContent = 'Home';
    homeCrumb.addEventListener('click', goHome);
    breadcrumbEl.appendChild(homeCrumb);

    navStack.forEach((entry, i) => {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = '/';
      breadcrumbEl.appendChild(sep);

      const crumb = document.createElement('span');
      const isLast = i === navStack.length - 1;
      crumb.className = 'crumb' + (isLast ? ' current' : ' is-link');
      crumb.textContent = entry.title;
      if (!isLast) {
        crumb.addEventListener('click', () => {
          navStack = navStack.slice(0, i + 1);
          renderCurrent();
        });
      }
      breadcrumbEl.appendChild(crumb);
    });
  }

  function goHome() {
    navStack = [];
    showView('home');
    renderBreadcrumb();
  }

  function renderChildGrid(container, childrenObj, onPick) {
    container.innerHTML = '';
    Object.entries(childrenObj).forEach(([key, node]) => {
      const card = document.createElement('button');
      card.className = 'child-card';
      const hasKids = !!node.children;
      card.innerHTML = `
        <h4>${node.title} ${hasKids ? '<span class="has-children-badge">' + Object.keys(node.children).length + ' types</span>' : ''}</h4>
        <p>${node.desc}</p>
      `;
      card.addEventListener('click', () => onPick(key, node));
      container.appendChild(card);
    });
  }

  function openCategory(catKey) {
    const cat = CATALOG[catKey];
    navStack = [{ key: catKey, title: cat.title }];
    document.getElementById('categoryTitle').textContent = cat.title;
    document.getElementById('categorySub').textContent = cat.sub;
    renderChildGrid(document.getElementById('childGrid'), cat.children, (key, node) => {
      handleChildPick(catKey, key, node, 'category');
    });
    showView('category');
    renderBreadcrumb();
  }

  function handleChildPick(catKey, key, node, fromLevel) {
    if (node.children) {
      navStack.push({ key, title: node.title });
      document.getElementById('subchildTitle').textContent = node.title;
      document.getElementById('subchildSub').textContent = node.desc;
      renderChildGrid(document.getElementById('subchildGrid'), node.children, (subKey, subNode) => {
        navStack.push({ key: subKey, title: subNode.title });
        openVisualizer(subNode);
      });
      showView('subchild');
      renderBreadcrumb();
    } else {
      navStack.push({ key, title: node.title });
      openVisualizer(node);
      renderBreadcrumb();
    }
  }

  function openVisualizer(node) {
    document.getElementById('vizTitle').textContent = node.title;
    document.getElementById('vizDesc').textContent = node.desc;
    showView('visualizer');
    renderBreadcrumb();
    Console.reset();
    window.__DSA.Modules.load(node.module);
  }

  // category cards on homepage
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => openCategory(card.dataset.category));
  });

  // back buttons
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.back;
      if (target === 'home') goHome();
      else if (target === 'category') {
        navStack = navStack.slice(0, 1);
        openCategory(navStack[0].key);
      }
    });
  });

  document.getElementById('workspaceBack').addEventListener('click', () => {
    // go back one level: if current path has a subchild level, return to it, else category, else home
    if (navStack.length >= 3) {
      const catKey = navStack[0].key;
      navStack = navStack.slice(0, navStack.length - 1);
      const cat = CATALOG[catKey];
      const midKey = navStack[1].key;
      const midNode = cat.children[midKey];
      document.getElementById('subchildTitle').textContent = midNode.title;
      document.getElementById('subchildSub').textContent = midNode.desc;
      renderChildGrid(document.getElementById('subchildGrid'), midNode.children, (subKey, subNode) => {
        navStack.push({ key: subKey, title: subNode.title });
        openVisualizer(subNode);
      });
      showView('subchild');
      renderBreadcrumb();
    } else if (navStack.length === 2) {
      const catKey = navStack[0].key;
      navStack = navStack.slice(0, 1);
      openCategory(catKey);
    } else {
      goHome();
    }
  });

  document.getElementById('brandHome').addEventListener('click', goHome);
  document.getElementById('ctaExplore').addEventListener('click', () => {
    document.querySelector('.categories').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('ctaComplexity').addEventListener('click', () => {
    navStack = [];
    showView('complexity');
    renderBreadcrumb();
    window.__DSA.ComplexityAnalyzer.init();
  });

  /* =========================================================
     5. CONSOLE
  ========================================================= */
  const Console = {
    currentEl: document.getElementById('consoleCurrent'),
    stateEl: document.getElementById('consoleState'),
    logEl: document.getElementById('consoleLog'),
    timeEl: document.getElementById('statTime'),
    spaceEl: document.getElementById('statSpace'),
    history: [],

    reset() {
      this.history = [];
      this.currentEl.textContent = '— idle —';
      this.stateEl.textContent = '[ ]';
      this.timeEl.textContent = '—';
      this.spaceEl.textContent = '—';
      this.logEl.innerHTML = '<div class="log-empty">No operations yet. Try one above.</div>';
    },

    setComplexity(time, space) {
      this.timeEl.textContent = time || '—';
      this.spaceEl.textContent = space || '—';
    },

    setState(stateStr) {
      this.stateEl.textContent = stateStr;
    },

    log(operationText, time, space) {
      this.currentEl.textContent = operationText;
      if (time !== undefined) this.setComplexity(time, space);

      const entry = { text: operationText, time: new Date().toLocaleTimeString() };
      this.history.unshift(entry);
      if (this.history.length > 50) this.history.pop();

      this.logEl.innerHTML = '';
      this.history.forEach(item => {
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `<span class="log-prompt">&gt;</span>${item.text}<span class="log-time">${item.time}</span>`;
        this.logEl.appendChild(line);
      });
    }
  };

  /* expose for module files defined below */
  window.__DSA = { Console, CATALOG };

})();

/* ===========================================================
   6. MODULE REGISTRY + SHARED HELPERS
=========================================================== */
(function () {
  'use strict';
  const Console = window.__DSA.Console;
  const controlsBody = document.getElementById('controlsBody');
  const vizStage = document.getElementById('vizStage');

  function clearStage() { vizStage.innerHTML = ''; }
  function clearControls() { controlsBody.innerHTML = ''; }

  function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function makeGroup(labelText) {
    const g = el('div', 'control-group');
    if (labelText) g.appendChild(el('span', 'control-group-label', labelText));
    return g;
  }

  function makeOpBtn(text, handler, opts = {}) {
    const b = el('button', 'op-btn' + (opts.danger ? ' danger' : ''));
    b.innerHTML = `<span>${text}</span>${opts.kbd ? `<span class="kbd">${opts.kbd}</span>` : ''}`;
    b.addEventListener('click', handler);
    return b;
  }

  function makeInput(placeholder, type = 'text') {
    const i = el('input', 'field-input');
    i.type = type;
    i.placeholder = placeholder;
    return i;
  }

  function makeLabel(text) { return el('label', 'field-label', text); }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function emptyStage(msg) {
    clearStage();
    vizStage.appendChild(el('div', 'viz-empty', msg || 'Structure is empty. Try an insert operation.'));
  }

  // shared helpers exposed to module implementations
  const Helpers = { clearStage, clearControls, el, makeGroup, makeOpBtn, makeInput, makeLabel, sleep, emptyStage, vizStage, controlsBody, Console };

  const registry = {};
  function register(name, factory) { registry[name] = factory; }

  let activeModule = null;

  const Modules = {
    load(name) {
      if (activeModule && activeModule.destroy) activeModule.destroy();
      clearStage(); clearControls();
      const factory = registry[name];
      if (!factory) {
        vizStage.appendChild(el('div', 'viz-empty', 'Module "' + name + '" not implemented yet.'));
        return;
      }
      activeModule = factory(Helpers) || {};
      if (activeModule.init) activeModule.init();
    }
  };

  window.__DSA.Modules = Modules;
  window.__DSA.registerModule = register;
  window.__DSA.Helpers = Helpers;
})();

/* ===========================================================
   7a. ARRAY MODULE
=========================================================== */
(function () {
  const { el, makeGroup, makeOpBtn, makeInput, makeLabel, vizStage, controlsBody, Console, emptyStage } = window.__DSA.Helpers;

  window.__DSA.registerModule('array', () => {
    let data = [12, 45, 7, 23, 56];

    function render(highlight = {}) {
      if (data.length === 0) { emptyStage('Array is empty.'); Console.setState('[ ]'); return; }
      vizStage.innerHTML = '';
      const row = el('div', 'viz-row');
      data.forEach((val, i) => {
        const box = el('div', 'box');
        if (highlight.active === i) box.classList.add('active');
        if (highlight.compare === i) box.classList.add('compare');
        if (highlight.removing === i) box.classList.add('removing');
        if (highlight.newItem === i) box.classList.add('new-item');
        box.innerHTML = `${val}<span class="box-index">${i}</span>`;
        row.appendChild(box);
      });
      vizStage.appendChild(row);
      Console.setState('[ ' + data.join(', ') + ' ]');
    }

    function renderControls() {
      controlsBody.innerHTML = '';

      const g1 = makeGroup('Insert');
      const idxInput = makeInput('value, e.g. 10', 'number');
      g1.appendChild(makeLabel('Value'));
      g1.appendChild(idxInput);
      g1.appendChild(makeOpBtn('Insert Beginning', () => {
        const v = Number(idxInput.value); if (idxInput.value === '') return;
        data.unshift(v); render({ newItem: 0 });
        Console.log(`INSERT_BEGINNING(${v})`, 'O(n)', 'O(1)');
      }));
      g1.appendChild(makeOpBtn('Insert End', () => {
        const v = Number(idxInput.value); if (idxInput.value === '') return;
        data.push(v); render({ newItem: data.length - 1 });
        Console.log(`INSERT_END(${v})`, 'O(1)', 'O(1)');
      }));
      const posInput = makeInput('index', 'number');
      g1.appendChild(makeLabel('Index (for Insert at Index)'));
      g1.appendChild(posInput);
      g1.appendChild(makeOpBtn('Insert at Index', () => {
        const v = Number(idxInput.value), p = Number(posInput.value);
        if (idxInput.value === '' || posInput.value === '' || p < 0 || p > data.length) return;
        data.splice(p, 0, v); render({ newItem: p });
        Console.log(`INSERT_AT_INDEX(${p}, ${v})`, 'O(n)', 'O(1)');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Delete');
      g2.appendChild(makeOpBtn('Delete Beginning', () => {
        if (!data.length) return;
        render({ removing: 0 });
        setTimeout(() => { data.shift(); render(); }, 280);
        Console.log('DELETE_BEGINNING()', 'O(n)', 'O(1)');
      }, { danger: true }));
      g2.appendChild(makeOpBtn('Delete End', () => {
        if (!data.length) return;
        render({ removing: data.length - 1 });
        setTimeout(() => { data.pop(); render(); }, 280);
        Console.log('DELETE_END()', 'O(1)', 'O(1)');
      }, { danger: true }));
      const delIdx = makeInput('index', 'number');
      g2.appendChild(makeLabel('Index (for Delete at Index)'));
      g2.appendChild(delIdx);
      g2.appendChild(makeOpBtn('Delete at Index', () => {
        const p = Number(delIdx.value);
        if (delIdx.value === '' || p < 0 || p >= data.length) return;
        render({ removing: p });
        setTimeout(() => { data.splice(p, 1); render(); }, 280);
        Console.log(`DELETE_AT_INDEX(${p})`, 'O(n)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Update / Search');
      const upIdx = makeInput('index', 'number'); const upVal = makeInput('new value', 'number');
      g3.appendChild(makeLabel('Update'));
      const row = el('div', 'input-row'); row.appendChild(upIdx); row.appendChild(upVal); g3.appendChild(row);
      g3.appendChild(makeOpBtn('Update', () => {
        const p = Number(upIdx.value), v = Number(upVal.value);
        if (upIdx.value === '' || upVal.value === '' || p < 0 || p >= data.length) return;
        data[p] = v; render({ active: p });
        Console.log(`UPDATE(${p}, ${v})`, 'O(1)', 'O(1)');
      }));
      const searchVal = makeInput('value to find', 'number');
      g3.appendChild(makeLabel('Search'));
      g3.appendChild(searchVal);
      g3.appendChild(makeOpBtn('Search', async () => {
        const v = Number(searchVal.value); if (searchVal.value === '') return;
        let found = -1;
        for (let i = 0; i < data.length; i++) {
          render({ compare: i });
          Console.log(`SEARCH: checking index ${i} (${data[i]})`, 'O(n)', 'O(1)');
          await new Promise(r => setTimeout(r, 260));
          if (data[i] === v) { found = i; break; }
        }
        if (found >= 0) { render({ active: found }); Console.log(`SEARCH(${v}) → found at index ${found}`, 'O(n)', 'O(1)'); }
        else { render(); Console.log(`SEARCH(${v}) → not found`, 'O(n)', 'O(1)'); }
      }));
      controlsBody.appendChild(g3);

      const g4 = makeGroup('Whole-array operations');
      g4.appendChild(makeOpBtn('Reverse', () => {
        data.reverse(); render();
        Console.log('REVERSE()', 'O(n)', 'O(1)');
      }));
      g4.appendChild(makeOpBtn('Sort (ascending)', () => {
        data.sort((a, b) => a - b); render();
        Console.log('SORT() ascending', 'O(n log n)', 'O(1)');
      }));
      g4.appendChild(makeOpBtn('Traverse', async () => {
        for (let i = 0; i < data.length; i++) {
          render({ active: i });
          Console.log(`TRAVERSE: visiting index ${i} (${data[i]})`, 'O(n)', 'O(1)');
          await new Promise(r => setTimeout(r, 220));
        }
        render();
      }));
      g4.appendChild(makeOpBtn('Clear', () => {
        data = []; render();
        Console.log('CLEAR()', 'O(1)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g4);
    }

    return {
      init() { renderControls(); render(); Console.log('Array initialized', 'O(1)', 'O(n)'); }
    };
  });
})();

/* ===========================================================
   7b. LINKED LIST MODULES (singly / doubly / circular)
=========================================================== */
(function () {
  const { el, makeGroup, makeOpBtn, makeInput, makeLabel, vizStage, controlsBody, Console, emptyStage } = window.__DSA.Helpers;

  function makeLinkedListModule(kind) {
    return () => {
      let data = [10, 20, 30];
      const isDoubly = kind === 'doubly';
      const isCircular = kind === 'circular';

      function render(highlight = {}) {
        if (!data.length) { emptyStage('List is empty.'); Console.setState('HEAD → null'); return; }
        vizStage.innerHTML = '';
        const row = el('div', 'll-row');
        row.appendChild(el('span', 'll-null', 'HEAD'));
        data.forEach((val, i) => {
          const wrap = el('div', 'll-node');
          const box = el('div', 'box');
          if (highlight.active === i) box.classList.add('active');
          if (highlight.compare === i) box.classList.add('compare');
          if (highlight.removing === i) box.classList.add('removing');
          if (highlight.newItem === i) box.classList.add('new-item');
          box.textContent = val;
          wrap.appendChild(box);
          if (i < data.length - 1) {
            wrap.appendChild(el('span', 'node-arrow', isDoubly ? '⇄' : '→'));
          }
          row.appendChild(wrap);
        });
        if (isCircular) {
          row.appendChild(el('span', 'node-arrow', '↻'));
          row.appendChild(el('span', 'll-null', 'HEAD'));
        } else {
          row.appendChild(el('span', 'node-arrow', '→'));
          row.appendChild(el('span', 'll-null', 'null'));
        }
        vizStage.appendChild(row);
        Console.setState('[ ' + data.join(' → ') + (isCircular ? ' → (head)' : ' → null') + ' ]');
      }

      function renderControls() {
        controlsBody.innerHTML = '';

        const g1 = makeGroup('Insert');
        const val = makeInput('value', 'number');
        g1.appendChild(makeLabel('Value'));
        g1.appendChild(val);
        g1.appendChild(makeOpBtn('Insert Head', () => {
          if (val.value === '') return;
          data.unshift(Number(val.value)); render({ newItem: 0 });
          Console.log(`INSERT_HEAD(${val.value})`, 'O(1)', 'O(1)');
        }));
        g1.appendChild(makeOpBtn('Insert Tail', () => {
          if (val.value === '') return;
          data.push(Number(val.value)); render({ newItem: data.length - 1 });
          Console.log(`INSERT_TAIL(${val.value})`, isDoubly ? 'O(1)' : 'O(n)', 'O(1)');
        }));
        const posInput = makeInput('position index', 'number');
        g1.appendChild(makeLabel('Position (for Insert at Position)'));
        g1.appendChild(posInput);
        g1.appendChild(makeOpBtn('Insert at Position', () => {
          const p = Number(posInput.value);
          if (val.value === '' || posInput.value === '' || p < 0 || p > data.length) return;
          data.splice(p, 0, Number(val.value)); render({ newItem: p });
          Console.log(`INSERT_POSITION(${p}, ${val.value})`, 'O(n)', 'O(1)');
        }));
        controlsBody.appendChild(g1);

        const g2 = makeGroup('Delete');
        g2.appendChild(makeOpBtn('Delete Head', () => {
          if (!data.length) return;
          render({ removing: 0 });
          setTimeout(() => { data.shift(); render(); }, 280);
          Console.log('DELETE_HEAD()', 'O(1)', 'O(1)');
        }, { danger: true }));
        g2.appendChild(makeOpBtn('Delete Tail', () => {
          if (!data.length) return;
          render({ removing: data.length - 1 });
          setTimeout(() => { data.pop(); render(); }, 280);
          Console.log('DELETE_TAIL()', isDoubly ? 'O(1)' : 'O(n)', 'O(1)');
        }, { danger: true }));
        const delPos = makeInput('position index', 'number');
        g2.appendChild(makeLabel('Position (for Delete at Position)'));
        g2.appendChild(delPos);
        g2.appendChild(makeOpBtn('Delete at Position', () => {
          const p = Number(delPos.value);
          if (delPos.value === '' || p < 0 || p >= data.length) return;
          render({ removing: p });
          setTimeout(() => { data.splice(p, 1); render(); }, 280);
          Console.log(`DELETE_POSITION(${p})`, 'O(n)', 'O(1)');
        }, { danger: true }));
        controlsBody.appendChild(g2);

        const g3 = makeGroup('Search / Traverse');
        const searchVal = makeInput('value to find', 'number');
        g3.appendChild(makeLabel('Search'));
        g3.appendChild(searchVal);
        g3.appendChild(makeOpBtn('Search', async () => {
          if (searchVal.value === '') return;
          const v = Number(searchVal.value);
          let found = -1;
          for (let i = 0; i < data.length; i++) {
            render({ compare: i });
            Console.log(`SEARCH: visiting node ${i} (${data[i]})`, 'O(n)', 'O(1)');
            await new Promise(r => setTimeout(r, 260));
            if (data[i] === v) { found = i; break; }
          }
          render(found >= 0 ? { active: found } : {});
          Console.log(`SEARCH(${v}) → ${found >= 0 ? 'found at position ' + found : 'not found'}`, 'O(n)', 'O(1)');
        }));
        g3.appendChild(makeOpBtn('Traverse', async () => {
          for (let i = 0; i < data.length; i++) {
            render({ active: i });
            Console.log(`TRAVERSE: node ${i} (${data[i]})`, 'O(n)', 'O(1)');
            await new Promise(r => setTimeout(r, 220));
          }
          render();
        }));
        controlsBody.appendChild(g3);

        const g4 = makeGroup('Other');
        g4.appendChild(makeOpBtn('Reverse', () => {
          data.reverse(); render();
          Console.log('REVERSE()', 'O(n)', 'O(1)');
        }));
        g4.appendChild(makeOpBtn('Count Nodes', () => {
          Console.log(`COUNT_NODES() → ${data.length}`, 'O(n)', 'O(1)');
        }));
        g4.appendChild(makeOpBtn('Clear', () => {
          data = []; render();
          Console.log('CLEAR()', 'O(1)', 'O(1)');
        }, { danger: true }));
        controlsBody.appendChild(g4);
      }

      return {
        init() { renderControls(); render(); Console.log(`${kind} linked list initialized`, 'O(1)', 'O(n)'); }
      };
    };
  }

  window.__DSA.registerModule('singlyLinkedList', makeLinkedListModule('singly'));
  window.__DSA.registerModule('doublyLinkedList', makeLinkedListModule('doubly'));
  window.__DSA.registerModule('circularLinkedList', makeLinkedListModule('circular'));
})();

/* ===========================================================
   7c. STACK MODULE
=========================================================== */
(function () {
  const { el, makeGroup, makeOpBtn, makeInput, makeLabel, vizStage, controlsBody, Console, emptyStage, sleep } = window.__DSA.Helpers;

  window.__DSA.registerModule('stack', () => {
    let data = [5, 12, 8];

    function render(highlight = {}) {
      if (!data.length) { emptyStage('Stack is empty.'); Console.setState('[ ] (top → bottom)'); return; }
      vizStage.innerHTML = '';
      const col = el('div', 'viz-row');
      col.style.flexDirection = 'column-reverse';
      data.forEach((val, i) => {
        const box = el('div', 'box');
        if (highlight.active === i) box.classList.add('active');
        if (highlight.removing === i) box.classList.add('removing');
        if (highlight.newItem === i) box.classList.add('new-item');
        box.innerHTML = `${val}${i === data.length - 1 ? '<span class="box-index">top</span>' : ''}`;
        col.appendChild(box);
      });
      vizStage.appendChild(col);
      Console.setState('[ ' + [...data].reverse().join(', ') + ' ] (top → bottom)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Push / Pop');
      const val = makeInput('value', 'number');
      g1.appendChild(makeLabel('Value'));
      g1.appendChild(val);
      g1.appendChild(makeOpBtn('Push', () => {
        if (val.value === '') return;
        data.push(Number(val.value)); render({ newItem: data.length - 1 });
        Console.log(`PUSH(${val.value})`, 'O(1)', 'O(1)');
      }));
      g1.appendChild(makeOpBtn('Pop', () => {
        if (!data.length) return;
        render({ removing: data.length - 1 });
        setTimeout(() => { data.pop(); render(); }, 280);
        Console.log('POP()', 'O(1)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Inspect');
      g2.appendChild(makeOpBtn('Peek', () => {
        if (!data.length) { Console.log('PEEK() → stack is empty', 'O(1)', 'O(1)'); return; }
        render({ active: data.length - 1 });
        Console.log(`PEEK() → ${data[data.length - 1]}`, 'O(1)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Size', () => {
        Console.log(`SIZE() → ${data.length}`, 'O(1)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Is Empty', () => {
        Console.log(`IS_EMPTY() → ${data.length === 0}`, 'O(1)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Clear', () => {
        data = []; render();
        Console.log('CLEAR()', 'O(1)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g2);
    }

    return { init() { renderControls(); render(); Console.log('Stack initialized', 'O(1)', 'O(n)'); } };
  });
})();

/* ===========================================================
   7d. QUEUE MODULES (simple / circular / priority / deque)
=========================================================== */
(function () {
  const { el, makeGroup, makeOpBtn, makeInput, makeLabel, vizStage, controlsBody, Console, emptyStage } = window.__DSA.Helpers;

  // --- Simple Queue ---
  window.__DSA.registerModule('simpleQueue', () => {
    let data = [3, 9, 14];

    function render(highlight = {}) {
      if (!data.length) { emptyStage('Queue is empty.'); Console.setState('[ ] (front → rear)'); return; }
      vizStage.innerHTML = '';
      const row = el('div', 'viz-row');
      data.forEach((val, i) => {
        const box = el('div', 'box');
        if (highlight.active === i) box.classList.add('active');
        if (highlight.removing === i) box.classList.add('removing');
        if (highlight.newItem === i) box.classList.add('new-item');
        let tag = '';
        if (i === 0) tag = 'front';
        if (i === data.length - 1) tag = tag ? tag : 'rear';
        box.innerHTML = `${val}${tag ? `<span class="box-index">${tag}</span>` : ''}`;
        row.appendChild(box);
      });
      vizStage.appendChild(row);
      Console.setState('[ ' + data.join(', ') + ' ] (front → rear)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Enqueue / Dequeue');
      const val = makeInput('value', 'number');
      g1.appendChild(makeLabel('Value'));
      g1.appendChild(val);
      g1.appendChild(makeOpBtn('Enqueue', () => {
        if (val.value === '') return;
        data.push(Number(val.value)); render({ newItem: data.length - 1 });
        Console.log(`ENQUEUE(${val.value})`, 'O(1)', 'O(1)');
      }));
      g1.appendChild(makeOpBtn('Dequeue', () => {
        if (!data.length) return;
        render({ removing: 0 });
        setTimeout(() => { data.shift(); render(); }, 280);
        Console.log('DEQUEUE()', 'O(1)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Inspect');
      g2.appendChild(makeOpBtn('Front', () => {
        if (!data.length) { Console.log('FRONT() → empty', 'O(1)', 'O(1)'); return; }
        render({ active: 0 }); Console.log(`FRONT() → ${data[0]}`, 'O(1)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Rear', () => {
        if (!data.length) { Console.log('REAR() → empty', 'O(1)', 'O(1)'); return; }
        render({ active: data.length - 1 }); Console.log(`REAR() → ${data[data.length - 1]}`, 'O(1)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Peek', () => {
        if (!data.length) { Console.log('PEEK() → empty', 'O(1)', 'O(1)'); return; }
        render({ active: 0 }); Console.log(`PEEK() → ${data[0]}`, 'O(1)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Size', () => Console.log(`SIZE() → ${data.length}`, 'O(1)', 'O(1)')));
      g2.appendChild(makeOpBtn('Clear', () => { data = []; render(); Console.log('CLEAR()', 'O(1)', 'O(1)'); }, { danger: true }));
      controlsBody.appendChild(g2);
    }

    return { init() { renderControls(); render(); Console.log('Simple queue initialized', 'O(1)', 'O(n)'); } };
  });

  // --- Circular Queue ---
  window.__DSA.registerModule('circularQueue', () => {
    const CAPACITY = 6;
    let buf = new Array(CAPACITY).fill(null);
    let front = -1, rear = -1, count = 0;

    function render(highlight = {}) {
      vizStage.innerHTML = '';
      const row = el('div', 'viz-row');
      for (let i = 0; i < CAPACITY; i++) {
        const box = el('div', 'box');
        if (buf[i] === null) box.style.opacity = '0.3';
        if (highlight.active === i) box.classList.add('active');
        if (highlight.removing === i) box.classList.add('removing');
        if (highlight.newItem === i) box.classList.add('new-item');
        let tag = '';
        if (i === front && count > 0) tag = 'front';
        if (i === rear && count > 0) tag = tag ? tag + '/rear' : 'rear';
        box.innerHTML = `${buf[i] === null ? '·' : buf[i]}<span class="box-index">${i}${tag ? ' ' + tag : ''}</span>`;
        row.appendChild(box);
      }
      vizStage.appendChild(row);
      Console.setState(`buffer=[ ${buf.map(v => v === null ? '·' : v).join(', ')} ] front=${front} rear=${rear} count=${count}/${CAPACITY}`);
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup(`Enqueue / Dequeue (capacity ${CAPACITY})`);
      const val = makeInput('value', 'number');
      g1.appendChild(makeLabel('Value'));
      g1.appendChild(val);
      g1.appendChild(makeOpBtn('Enqueue', () => {
        if (val.value === '') return;
        if (count === CAPACITY) { Console.log('ENQUEUE() → queue is full', 'O(1)', 'O(1)'); return; }
        if (front === -1) front = 0;
        rear = (rear + 1) % CAPACITY;
        buf[rear] = Number(val.value); count++;
        render({ newItem: rear });
        Console.log(`ENQUEUE(${val.value}) → slot ${rear}`, 'O(1)', 'O(1)');
      }));
      g1.appendChild(makeOpBtn('Dequeue', () => {
        if (count === 0) { Console.log('DEQUEUE() → queue is empty', 'O(1)', 'O(1)'); return; }
        const removedIdx = front;
        render({ removing: removedIdx });
        setTimeout(() => {
          buf[front] = null; count--;
          if (count === 0) { front = -1; rear = -1; }
          else front = (front + 1) % CAPACITY;
          render();
        }, 280);
        Console.log(`DEQUEUE() → slot ${removedIdx}`, 'O(1)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Inspect');
      g2.appendChild(makeOpBtn('Front', () => { if (count) render({ active: front }); Console.log(`FRONT() → ${count ? buf[front] : 'empty'}`, 'O(1)', 'O(1)'); }));
      g2.appendChild(makeOpBtn('Rear', () => { if (count) render({ active: rear }); Console.log(`REAR() → ${count ? buf[rear] : 'empty'}`, 'O(1)', 'O(1)'); }));
      g2.appendChild(makeOpBtn('Peek', () => { if (count) render({ active: front }); Console.log(`PEEK() → ${count ? buf[front] : 'empty'}`, 'O(1)', 'O(1)'); }));
      g2.appendChild(makeOpBtn('Is Full', () => Console.log(`IS_FULL() → ${count === CAPACITY}`, 'O(1)', 'O(1)')));
      g2.appendChild(makeOpBtn('Is Empty', () => Console.log(`IS_EMPTY() → ${count === 0}`, 'O(1)', 'O(1)')));
      g2.appendChild(makeOpBtn('Clear', () => { buf = new Array(CAPACITY).fill(null); front = -1; rear = -1; count = 0; render(); Console.log('CLEAR()', 'O(n)', 'O(1)'); }, { danger: true }));
      controlsBody.appendChild(g2);
    }

    return { init() { renderControls(); render(); Console.log('Circular queue initialized', 'O(1)', 'O(n)'); } };
  });

  // --- Priority Queue ---
  window.__DSA.registerModule('priorityQueue', () => {
    let data = [{ v: 10, p: 2 }, { v: 5, p: 5 }, { v: 20, p: 1 }];

    function sortedView() { return [...data].sort((a, b) => b.p - a.p); }

    function render(highlight = {}) {
      const view = sortedView();
      if (!view.length) { emptyStage('Priority queue is empty.'); Console.setState('[ ]'); return; }
      vizStage.innerHTML = '';
      const row = el('div', 'viz-row');
      view.forEach((item, i) => {
        const box = el('div', 'box');
        if (highlight.active === i) box.classList.add('active');
        if (highlight.removing === i) box.classList.add('removing');
        if (highlight.newItem === i) box.classList.add('new-item');
        box.innerHTML = `${item.v}<span class="box-index">p=${item.p}</span>`;
        row.appendChild(box);
      });
      vizStage.appendChild(row);
      Console.setState('[ ' + view.map(d => `${d.v}(p${d.p})`).join(', ') + ' ]  (highest priority first)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Insert');
      const val = makeInput('value', 'number'); const pr = makeInput('priority (higher = more urgent)', 'number');
      g1.appendChild(makeLabel('Value')); g1.appendChild(val);
      g1.appendChild(makeLabel('Priority')); g1.appendChild(pr);
      g1.appendChild(makeOpBtn('Insert with Priority', () => {
        if (val.value === '' || pr.value === '') return;
        data.push({ v: Number(val.value), p: Number(pr.value) });
        render({ newItem: sortedView().findIndex(d => d.v === Number(val.value) && d.p === Number(pr.value)) });
        Console.log(`INSERT(${val.value}, priority=${pr.value})`, 'O(log n)', 'O(1)');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Remove / Inspect');
      g2.appendChild(makeOpBtn('Delete Highest Priority', () => {
        if (!data.length) return;
        render({ removing: 0 });
        const top = sortedView()[0];
        setTimeout(() => {
          const idx = data.indexOf(top);
          data.splice(idx, 1); render();
        }, 280);
        Console.log(`DELETE_HIGHEST_PRIORITY() → ${top.v}(p${top.p})`, 'O(n)', 'O(1)');
      }, { danger: true }));
      g2.appendChild(makeOpBtn('Peek', () => {
        if (!data.length) { Console.log('PEEK() → empty', 'O(1)', 'O(1)'); return; }
        render({ active: 0 });
        Console.log(`PEEK() → ${sortedView()[0].v}(p${sortedView()[0].p})`, 'O(1)', 'O(1)');
      }));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Update / Search');
      const searchVal = makeInput('value to find', 'number');
      g3.appendChild(makeLabel('Search by value')); g3.appendChild(searchVal);
      g3.appendChild(makeOpBtn('Search', () => {
        if (searchVal.value === '') return;
        const v = Number(searchVal.value);
        const idx = sortedView().findIndex(d => d.v === v);
        if (idx >= 0) render({ active: idx });
        Console.log(`SEARCH(${v}) → ${idx >= 0 ? 'found, priority=' + sortedView()[idx].p : 'not found'}`, 'O(n)', 'O(1)');
      }));
      const updVal = makeInput('value', 'number'); const updPr = makeInput('new priority', 'number');
      g3.appendChild(makeLabel('Update priority')); 
      const row = el('div', 'input-row'); row.appendChild(updVal); row.appendChild(updPr); g3.appendChild(row);
      g3.appendChild(makeOpBtn('Update Priority', () => {
        if (updVal.value === '' || updPr.value === '') return;
        const item = data.find(d => d.v === Number(updVal.value));
        if (item) { item.p = Number(updPr.value); render(); }
        Console.log(`UPDATE_PRIORITY(${updVal.value} → p${updPr.value})`, 'O(n)', 'O(1)');
      }));
      g3.appendChild(makeOpBtn('Clear', () => { data = []; render(); Console.log('CLEAR()', 'O(1)', 'O(1)'); }, { danger: true }));
      controlsBody.appendChild(g3);
    }

    return { init() { renderControls(); render(); Console.log('Priority queue initialized', 'O(1)', 'O(n)'); } };
  });

  // --- Deque ---
  window.__DSA.registerModule('deque', () => {
    let data = [4, 8, 15];

    function render(highlight = {}) {
      if (!data.length) { emptyStage('Deque is empty.'); Console.setState('[ ] (front ↔ rear)'); return; }
      vizStage.innerHTML = '';
      const row = el('div', 'viz-row');
      data.forEach((val, i) => {
        const box = el('div', 'box');
        if (highlight.active === i) box.classList.add('active');
        if (highlight.removing === i) box.classList.add('removing');
        if (highlight.newItem === i) box.classList.add('new-item');
        let tag = '';
        if (i === 0) tag = 'front';
        if (i === data.length - 1) tag = tag ? tag + '/rear' : 'rear';
        box.innerHTML = `${val}${tag ? `<span class="box-index">${tag}</span>` : ''}`;
        row.appendChild(box);
      });
      vizStage.appendChild(row);
      Console.setState('[ ' + data.join(', ') + ' ] (front ↔ rear)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Insert');
      const val = makeInput('value', 'number');
      g1.appendChild(makeLabel('Value')); g1.appendChild(val);
      g1.appendChild(makeOpBtn('Insert Front', () => {
        if (val.value === '') return;
        data.unshift(Number(val.value)); render({ newItem: 0 });
        Console.log(`INSERT_FRONT(${val.value})`, 'O(1)', 'O(1)');
      }));
      g1.appendChild(makeOpBtn('Insert Rear', () => {
        if (val.value === '') return;
        data.push(Number(val.value)); render({ newItem: data.length - 1 });
        Console.log(`INSERT_REAR(${val.value})`, 'O(1)', 'O(1)');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Delete');
      g2.appendChild(makeOpBtn('Delete Front', () => {
        if (!data.length) return;
        render({ removing: 0 });
        setTimeout(() => { data.shift(); render(); }, 280);
        Console.log('DELETE_FRONT()', 'O(1)', 'O(1)');
      }, { danger: true }));
      g2.appendChild(makeOpBtn('Delete Rear', () => {
        if (!data.length) return;
        render({ removing: data.length - 1 });
        setTimeout(() => { data.pop(); render(); }, 280);
        Console.log('DELETE_REAR()', 'O(1)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Inspect');
      g3.appendChild(makeOpBtn('Peek Front', () => { if (data.length) render({ active: 0 }); Console.log(`PEEK_FRONT() → ${data.length ? data[0] : 'empty'}`, 'O(1)', 'O(1)'); }));
      g3.appendChild(makeOpBtn('Peek Rear', () => { if (data.length) render({ active: data.length - 1 }); Console.log(`PEEK_REAR() → ${data.length ? data[data.length - 1] : 'empty'}`, 'O(1)', 'O(1)'); }));
      g3.appendChild(makeOpBtn('Clear', () => { data = []; render(); Console.log('CLEAR()', 'O(1)', 'O(1)'); }, { danger: true }));
      controlsBody.appendChild(g3);
    }

    return { init() { renderControls(); render(); Console.log('Deque initialized', 'O(1)', 'O(n)'); } };
  });
})();

/* ===========================================================
   7e. HASH TABLE MODULE
=========================================================== */
(function () {
  const { el, makeGroup, makeOpBtn, makeInput, makeLabel, vizStage, controlsBody, Console } = window.__DSA.Helpers;

  window.__DSA.registerModule('hashTable', () => {
    const SIZE = 7;
    let buckets = Array.from({ length: SIZE }, () => []); // each: {key, value}
    let mode = 'chaining'; // 'chaining' | 'probing'
    let probeSlots = new Array(SIZE).fill(null); // for linear probing display

    function hash(key) {
      let str = String(key);
      let h = 0;
      for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % SIZE;
      return h;
    }

    function render(highlight = {}) {
      vizStage.innerHTML = '';
      const grid = el('div', 'hash-grid');
      for (let i = 0; i < SIZE; i++) {
        const rowEl = el('div', 'hash-row');
        rowEl.appendChild(el('span', 'hash-index', i + ''));
        const bucket = el('div', 'hash-bucket');
        if (highlight.active === i) bucket.style.borderColor = 'var(--accent)';
        if (highlight.compare === i) bucket.style.borderColor = 'var(--amber)';

        if (mode === 'chaining') {
          buckets[i].forEach(entry => {
            bucket.appendChild(el('span', 'hash-chip', `${entry.key}:${entry.value}`));
          });
        } else {
          if (probeSlots[i] !== null) {
            bucket.appendChild(el('span', 'hash-chip', `${probeSlots[i].key}:${probeSlots[i].value}`));
          }
        }
        rowEl.appendChild(bucket);
        grid.appendChild(rowEl);
      }
      vizStage.appendChild(grid);

      const stateStr = mode === 'chaining'
        ? buckets.map((b, i) => `${i}:[${b.map(e => e.key + ':' + e.value).join(',')}]`).join(' ')
        : probeSlots.map((s, i) => `${i}:${s ? s.key + ':' + s.value : '·'}`).join(' ');
      Console.setState(stateStr);
    }

    function renderControls() {
      controlsBody.innerHTML = '';

      const gMode = makeGroup('Collision Handling');
      const select = el('select', 'select-input');
      select.innerHTML = `<option value="chaining">Separate Chaining</option><option value="probing">Linear Probing</option>`;
      select.value = mode;
      select.addEventListener('change', () => {
        mode = select.value;
        // rebuild from whichever structure currently has data
        const entries = mode === 'chaining'
          ? probeSlots.filter(Boolean)
          : buckets.flat();
        buckets = Array.from({ length: SIZE }, () => []);
        probeSlots = new Array(SIZE).fill(null);
        entries.forEach(e => insert(e.key, e.value, false));
        render();
        Console.log(`SWITCH_MODE(${mode})`, '—', '—');
      });
      gMode.appendChild(select);
      controlsBody.appendChild(gMode);

      const g1 = makeGroup('Insert / Update');
      const keyIn = makeInput('key', 'text'); const valIn = makeInput('value', 'text');
      g1.appendChild(makeLabel('Key')); g1.appendChild(keyIn);
      g1.appendChild(makeLabel('Value')); g1.appendChild(valIn);
      g1.appendChild(makeOpBtn('Insert', () => {
        if (!keyIn.value) return;
        insert(keyIn.value, valIn.value || '');
      }));
      g1.appendChild(makeOpBtn('Update', () => {
        if (!keyIn.value) return;
        const removed = remove(keyIn.value, true);
        insert(keyIn.value, valIn.value || '', true);
        Console.log(`UPDATE(${keyIn.value} → ${valIn.value})`, 'O(1) avg', 'O(1)');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Search / Delete');
      const searchKey = makeInput('key to find', 'text');
      g2.appendChild(makeLabel('Key')); g2.appendChild(searchKey);
      g2.appendChild(makeOpBtn('Search', () => {
        if (!searchKey.value) return;
        const idx = hash(searchKey.value);
        render({ active: idx });
        const found = mode === 'chaining'
          ? buckets[idx].find(e => e.key === searchKey.value)
          : findProbe(searchKey.value);
        Console.log(`SEARCH(${searchKey.value}) → bucket ${idx} → ${found ? 'found: ' + found.value : 'not found'}`, 'O(1) avg', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Delete', () => {
        if (!searchKey.value) return;
        remove(searchKey.value, false);
      }, { danger: true }));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Other');
      g3.appendChild(makeOpBtn('Traverse', () => {
        const entries = mode === 'chaining' ? buckets.flat() : probeSlots.filter(Boolean);
        Console.log(`TRAVERSE() → [ ${entries.map(e => e.key + ':' + e.value).join(', ')} ]`, 'O(n)', 'O(1)');
      }));
      g3.appendChild(makeOpBtn('Clear', () => {
        buckets = Array.from({ length: SIZE }, () => []);
        probeSlots = new Array(SIZE).fill(null);
        render();
        Console.log('CLEAR()', 'O(n)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g3);
    }

    function findProbe(key) {
      for (let i = 0; i < SIZE; i++) {
        const idx = (hash(key) + i) % SIZE;
        if (probeSlots[idx] && probeSlots[idx].key === key) return probeSlots[idx];
        if (probeSlots[idx] === null) return null;
      }
      return null;
    }

    function insert(key, value, silent) {
      const idx = hash(key);
      if (mode === 'chaining') {
        const existing = buckets[idx].find(e => e.key === key);
        if (existing) existing.value = value;
        else buckets[idx].push({ key, value });
        render({ active: idx });
        if (!silent) Console.log(`INSERT(${key}:${value}) → bucket ${idx} (chaining)`, 'O(1) avg', 'O(1)');
      } else {
        for (let i = 0; i < SIZE; i++) {
          const probeIdx = (idx + i) % SIZE;
          if (probeSlots[probeIdx] === null || probeSlots[probeIdx].key === key) {
            probeSlots[probeIdx] = { key, value };
            render({ active: probeIdx });
            if (!silent) Console.log(`INSERT(${key}:${value}) → slot ${probeIdx} (${i} probe${i !== 1 ? 's' : ''})`, 'O(1) avg', 'O(1)');
            return;
          }
        }
        if (!silent) Console.log(`INSERT(${key}:${value}) → table full`, 'O(n)', 'O(1)');
      }
    }

    function remove(key, silent) {
      const idx = hash(key);
      if (mode === 'chaining') {
        const before = buckets[idx].length;
        buckets[idx] = buckets[idx].filter(e => e.key !== key);
        render({ active: idx });
        if (!silent) Console.log(`DELETE(${key}) → bucket ${idx}${before === buckets[idx].length ? ' (not found)' : ''}`, 'O(1) avg', 'O(1)');
        return before !== buckets[idx].length;
      } else {
        for (let i = 0; i < SIZE; i++) {
          const probeIdx = (idx + i) % SIZE;
          if (probeSlots[probeIdx] && probeSlots[probeIdx].key === key) {
            probeSlots[probeIdx] = null;
            render({ active: probeIdx });
            if (!silent) Console.log(`DELETE(${key}) → slot ${probeIdx}`, 'O(1) avg', 'O(1)');
            return true;
          }
        }
        if (!silent) Console.log(`DELETE(${key}) → not found`, 'O(1) avg', 'O(1)');
        return false;
      }
    }

    return {
      init() {
        renderControls();
        insert('name', 'Ada', true);
        insert('lang', 'Py', true);
        render();
        Console.log('Hash table initialized (separate chaining, size 7)', 'O(1) avg', 'O(n)');
      }
    };
  });
})();

/* ===========================================================
   7f. SHARED SVG TREE RENDERER
   Used by Binary Tree, BST, AVL, Heaps.
   Node shape: { val, left, right, x, y, highlight }
=========================================================== */
(function () {
  const { vizStage, Console } = window.__DSA.Helpers;

  function layoutTree(root) {
    if (!root) return { nodes: [], edges: [], width: 400, height: 200 };
    // assign in-order x positions, depth-based y
    let counter = 0;
    const nodes = [];
    const edges = [];
    function assign(node, depth) {
      if (!node) return;
      assign(node.left, depth + 1);
      node._x = counter++;
      node._y = depth;
      assign(node.right, depth + 1);
    }
    assign(root, 0);
    const spacingX = 64, spacingY = 80, padX = 40, padY = 40;
    let maxDepth = 0;
    function collect(node) {
      if (!node) return;
      maxDepth = Math.max(maxDepth, node._y);
      const x = padX + node._x * spacingX;
      const y = padY + node._y * spacingY;
      node.x = x; node.y = y;
      nodes.push(node);
      if (node.left) { edges.push([x, y, padX + node.left._x * spacingX, padY + node.left._y * spacingY, node.left]); collect(node.left); }
      if (node.right) { edges.push([x, y, padX + node.right._x * spacingX, padY + node.right._y * spacingY, node.right]); collect(node.right); }
    }
    collect(root);
    const width = padX * 2 + counter * spacingX;
    const height = padY * 2 + (maxDepth + 1) * spacingY;
    return { nodes, edges, width: Math.max(width, 300), height: Math.max(height, 220) };
  }

  function renderTree(root, highlightSet = {}) {
    vizStage.innerHTML = '';
    if (!root) {
      const div = document.createElement('div');
      div.className = 'viz-empty';
      div.textContent = 'Tree is empty. Try an insert operation.';
      vizStage.appendChild(div);
      Console.setState('null');
      return;
    }
    const { nodes, edges, width, height } = layoutTree(root);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'svg-stage');
    svg.style.maxWidth = width + 'px';

    edges.forEach(([x1, y1, x2, y2, childNode]) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', `M${x1},${y1} L${x2},${y2}`);
      let cls = 'tree-edge';
      if (highlightSet.visitedEdges && highlightSet.visitedEdges.has(childNode)) cls += ' visited';
      if (highlightSet.activeEdge === childNode) cls += ' active';
      line.setAttribute('class', cls);
      svg.appendChild(line);
    });

    nodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      let cls = 'tree-node';
      if (highlightSet.active === node) cls += ' active';
      if (highlightSet.compare === node) cls += ' compare';
      if (highlightSet.visited && highlightSet.visited.has(node)) cls += ' visited';
      if (highlightSet.removing === node) cls += ' removing';
      g.setAttribute('class', cls);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x); circle.setAttribute('cy', node.y); circle.setAttribute('r', 20);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x); text.setAttribute('y', node.y + 1);
      text.textContent = node.val;
      g.appendChild(circle); g.appendChild(text);
      svg.appendChild(g);
    });

    vizStage.appendChild(svg);

    function toArr(node) {
      if (!node) return [];
      return [...toArr(node.left), node.val, ...toArr(node.right)];
    }
    Console.setState('in-order: [ ' + toArr(root).join(', ') + ' ]');
  }

  window.__DSA.TreeRenderer = { renderTree, layoutTree };
})();

/* ===========================================================
   7g. BINARY TREE MODULE (generic, level-order insert)
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, makeInput, makeLabel, controlsBody, Console, sleep } = window.__DSA.Helpers;
  const { renderTree } = window.__DSA.TreeRenderer;

  window.__DSA.registerModule('binaryTree', () => {
    let root = null;

    function makeNode(val) { return { val, left: null, right: null }; }

    function insertLevelOrder(val) {
      const node = makeNode(val);
      if (!root) { root = node; return; }
      const q = [root];
      while (q.length) {
        const cur = q.shift();
        if (!cur.left) { cur.left = node; return; }
        else q.push(cur.left);
        if (!cur.right) { cur.right = node; return; }
        else q.push(cur.right);
      }
    }

    function countNodes(node) { return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0; }
    function height(node) { return node ? 1 + Math.max(height(node.left), height(node.right)) : 0; }

    function deleteDeepest(node, dNode) {
      const q = [node]; let last = null;
      while (q.length) {
        const cur = q.shift();
        if (cur === dNode) { last = null; continue; }
        if (cur.right) { if (cur.right === dNode) { cur.right = null; return; } q.push(cur.right); }
        if (cur.left) { if (cur.left === dNode) { cur.left = null; return; } q.push(cur.left); }
      }
    }

    function deleteValue(val) {
      if (!root) return false;
      const q = [root]; let target = null, lastNode = null;
      while (q.length) {
        lastNode = q.shift();
        if (lastNode.val === val && !target) target = lastNode;
        if (lastNode.left) q.push(lastNode.left);
        if (lastNode.right) q.push(lastNode.right);
      }
      if (!target) return false;
      target.val = lastNode.val;
      if (lastNode === root && countNodes(root) === 1) { root = null; return true; }
      deleteDeepest(root, lastNode);
      return true;
    }

    async function traversal(type) {
      const order = [];
      function pre(n) { if (!n) return; order.push(n); pre(n.left); pre(n.right); }
      function ino(n) { if (!n) return; ino(n.left); order.push(n); ino(n.right); }
      function post(n) { if (!n) return; post(n.left); post(n.right); order.push(n); }
      function level(n) { if (!n) return; const q = [n]; while (q.length) { const c = q.shift(); order.push(c); if (c.left) q.push(c.left); if (c.right) q.push(c.right); } }
      if (type === 'pre') pre(root); if (type === 'in') ino(root); if (type === 'post') post(root); if (type === 'level') level(root);
      const visited = new Set();
      for (const n of order) {
        visited.add(n);
        renderTree(root, { active: n, visited: new Set(visited) });
        Console.log(`TRAVERSE(${type}-order): visiting ${n.val}`, 'O(n)', 'O(n)');
        await sleep(420);
      }
      renderTree(root);
      Console.log(`TRAVERSE(${type}-order) complete → [ ${order.map(n => n.val).join(', ')} ]`, 'O(n)', 'O(n)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Insert / Delete');
      const val = makeInput('value', 'number');
      g1.appendChild(makeLabel('Value')); g1.appendChild(val);
      g1.appendChild(makeOpBtn('Insert (level order)', () => {
        if (val.value === '') return;
        insertLevelOrder(Number(val.value));
        renderTree(root);
        Console.log(`INSERT(${val.value})`, 'O(n)', 'O(n)');
      }));
      g1.appendChild(makeOpBtn('Delete', () => {
        if (val.value === '') return;
        const ok = deleteValue(Number(val.value));
        renderTree(root);
        Console.log(`DELETE(${val.value}) → ${ok ? 'removed' : 'not found'}`, 'O(n)', 'O(n)');
      }, { danger: true }));
      g1.appendChild(makeOpBtn('Search', () => {
        if (val.value === '') return;
        const target = Number(val.value);
        function find(n) { if (!n) return null; if (n.val === target) return n; return find(n.left) || find(n.right); }
        const found = find(root);
        renderTree(root, found ? { active: found } : {});
        Console.log(`SEARCH(${val.value}) → ${found ? 'found' : 'not found'}`, 'O(n)', 'O(n)');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Properties');
      g2.appendChild(makeOpBtn('Count Nodes', () => Console.log(`COUNT_NODES() → ${countNodes(root)}`, 'O(n)', 'O(n)')));
      g2.appendChild(makeOpBtn('Height', () => Console.log(`HEIGHT() → ${height(root)}`, 'O(n)', 'O(n)')));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Traversals');
      g3.appendChild(makeOpBtn('Pre-order', () => traversal('pre')));
      g3.appendChild(makeOpBtn('In-order', () => traversal('in')));
      g3.appendChild(makeOpBtn('Post-order', () => traversal('post')));
      g3.appendChild(makeOpBtn('Level-order', () => traversal('level')));
      controlsBody.appendChild(g3);

      const g4 = makeGroup('Other');
      g4.appendChild(makeOpBtn('Clear', () => { root = null; renderTree(root); Console.log('CLEAR()', 'O(1)', 'O(1)'); }, { danger: true }));
      controlsBody.appendChild(g4);
    }

    return {
      init() {
        [50, 30, 70, 20, 40, 60, 80].forEach(insertLevelOrder);
        renderControls(); renderTree(root);
        Console.log('Binary tree initialized', 'O(1)', 'O(n)');
      }
    };
  });
})();

/* ===========================================================
   7h. BINARY SEARCH TREE MODULE
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, makeInput, makeLabel, controlsBody, Console, sleep } = window.__DSA.Helpers;
  const { renderTree } = window.__DSA.TreeRenderer;

  window.__DSA.registerModule('bst', () => {
    let root = null;
    function makeNode(val) { return { val, left: null, right: null }; }

    async function insert(val) {
      const node = makeNode(val);
      if (!root) { root = node; renderTree(root, { active: node }); return; }
      let cur = root;
      while (true) {
        renderTree(root, { compare: cur });
        Console.log(`INSERT(${val}): comparing with ${cur.val}`, 'O(log n) avg', 'O(1)');
        await sleep(350);
        if (val < cur.val) { if (!cur.left) { cur.left = node; break; } cur = cur.left; }
        else if (val > cur.val) { if (!cur.right) { cur.right = node; break; } cur = cur.right; }
        else { Console.log(`INSERT(${val}) → already exists`, 'O(log n) avg', 'O(1)'); renderTree(root); return; }
      }
      renderTree(root, { active: node });
      Console.log(`INSERT(${val}) complete`, 'O(log n) avg', 'O(1)');
    }

    async function search(val) {
      let cur = root;
      while (cur) {
        renderTree(root, { compare: cur });
        Console.log(`SEARCH(${val}): comparing with ${cur.val}`, 'O(log n) avg', 'O(1)');
        await sleep(350);
        if (val === cur.val) { renderTree(root, { active: cur }); Console.log(`SEARCH(${val}) → found`, 'O(log n) avg', 'O(1)'); return; }
        cur = val < cur.val ? cur.left : cur.right;
      }
      renderTree(root);
      Console.log(`SEARCH(${val}) → not found`, 'O(log n) avg', 'O(1)');
    }

    function deleteNode(node, val) {
      if (!node) return null;
      if (val < node.val) node.left = deleteNode(node.left, val);
      else if (val > node.val) node.right = deleteNode(node.right, val);
      else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let succ = node.right;
        while (succ.left) succ = succ.left;
        node.val = succ.val;
        node.right = deleteNode(node.right, succ.val);
      }
      return node;
    }

    function minNode(node) { while (node.left) node = node.left; return node; }
    function maxNode(node) { while (node.right) node = node.right; return node; }
    function height(node) { return node ? 1 + Math.max(height(node.left), height(node.right)) : 0; }

    async function traversal(type) {
      const order = [];
      function pre(n) { if (!n) return; order.push(n); pre(n.left); pre(n.right); }
      function ino(n) { if (!n) return; ino(n.left); order.push(n); ino(n.right); }
      function post(n) { if (!n) return; post(n.left); post(n.right); order.push(n); }
      if (type === 'pre') pre(root); if (type === 'in') ino(root); if (type === 'post') post(root);
      const visited = new Set();
      for (const n of order) {
        visited.add(n);
        renderTree(root, { active: n, visited: new Set(visited) });
        Console.log(`TRAVERSE(${type}-order): visiting ${n.val}`, 'O(n)', 'O(n)');
        await sleep(400);
      }
      renderTree(root);
      Console.log(`TRAVERSE(${type}-order) → [ ${order.map(n => n.val).join(', ')} ]`, 'O(n)', 'O(n)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Insert / Delete / Search');
      const val = makeInput('value', 'number');
      g1.appendChild(makeLabel('Value')); g1.appendChild(val);
      g1.appendChild(makeOpBtn('Insert', () => { if (val.value !== '') insert(Number(val.value)); }));
      g1.appendChild(makeOpBtn('Delete', () => {
        if (val.value === '') return;
        root = deleteNode(root, Number(val.value));
        renderTree(root);
        Console.log(`DELETE(${val.value})`, 'O(log n) avg', 'O(1)');
      }, { danger: true }));
      g1.appendChild(makeOpBtn('Search', () => { if (val.value !== '') search(Number(val.value)); }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Properties');
      g2.appendChild(makeOpBtn('Min', () => {
        if (!root) { Console.log('MIN() → tree is empty', 'O(log n) avg', 'O(1)'); return; }
        const n = minNode(root); renderTree(root, { active: n }); Console.log(`MIN() → ${n.val}`, 'O(log n) avg', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Max', () => {
        if (!root) { Console.log('MAX() → tree is empty', 'O(log n) avg', 'O(1)'); return; }
        const n = maxNode(root); renderTree(root, { active: n }); Console.log(`MAX() → ${n.val}`, 'O(log n) avg', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Height', () => Console.log(`HEIGHT() → ${height(root)}`, 'O(n)', 'O(n)')));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Traversals');
      g3.appendChild(makeOpBtn('Pre-order', () => traversal('pre')));
      g3.appendChild(makeOpBtn('In-order', () => traversal('in')));
      g3.appendChild(makeOpBtn('Post-order', () => traversal('post')));
      controlsBody.appendChild(g3);

      const g4 = makeGroup('Other');
      g4.appendChild(makeOpBtn('Clear', () => { root = null; renderTree(root); Console.log('CLEAR()', 'O(1)', 'O(1)'); }, { danger: true }));
      controlsBody.appendChild(g4);
    }

    return {
      init() {
        [50, 30, 70, 20, 40, 60, 80].forEach(v => {
          const node = makeNode(v);
          if (!root) { root = node; return; }
          let cur = root;
          while (true) {
            if (v < cur.val) { if (!cur.left) { cur.left = node; break; } cur = cur.left; }
            else { if (!cur.right) { cur.right = node; break; } cur = cur.right; }
          }
        });
        renderControls(); renderTree(root);
        Console.log('BST initialized', 'O(1)', 'O(n)');
      }
    };
  });
})();

/* ===========================================================
   7i. AVL TREE MODULE (with rotations)
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, makeInput, makeLabel, controlsBody, Console, sleep } = window.__DSA.Helpers;
  const { renderTree } = window.__DSA.TreeRenderer;

  window.__DSA.registerModule('avl', () => {
    let root = null;

    function makeNode(val) { return { val, left: null, right: null, height: 1 }; }
    function h(n) { return n ? n.height : 0; }
    function update(n) { n.height = 1 + Math.max(h(n.left), h(n.right)); }
    function balanceFactor(n) { return n ? h(n.left) - h(n.right) : 0; }

    function rotateRight(y) { const x = y.left; y.left = x.right; x.right = y; update(y); update(x); return x; }
    function rotateLeft(x) { const y = x.right; x.right = y.left; y.left = x; update(x); update(y); return y; }

    let lastRotation = '';

    function insertNode(node, val) {
      if (!node) return makeNode(val);
      if (val < node.val) node.left = insertNode(node.left, val);
      else if (val > node.val) node.right = insertNode(node.right, val);
      else return node;
      update(node);
      const bf = balanceFactor(node);
      if (bf > 1 && val < node.left.val) { lastRotation = 'RR Rotation (single right)'; return rotateRight(node); }
      if (bf < -1 && val > node.right.val) { lastRotation = 'LL Rotation (single left)'; return rotateLeft(node); }
      if (bf > 1 && val > node.left.val) { lastRotation = 'LR Rotation (left-right)'; node.left = rotateLeft(node.left); return rotateRight(node); }
      if (bf < -1 && val < node.right.val) { lastRotation = 'RL Rotation (right-left)'; node.right = rotateRight(node.right); return rotateLeft(node); }
      return node;
    }

    function minNode(node) { while (node.left) node = node.left; return node; }

    function deleteNode(node, val) {
      if (!node) return null;
      if (val < node.val) node.left = deleteNode(node.left, val);
      else if (val > node.val) node.right = deleteNode(node.right, val);
      else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        const succ = minNode(node.right);
        node.val = succ.val;
        node.right = deleteNode(node.right, succ.val);
      }
      update(node);
      const bf = balanceFactor(node);
      if (bf > 1) {
        if (balanceFactor(node.left) >= 0) { lastRotation = 'RR Rotation (single right)'; return rotateRight(node); }
        lastRotation = 'LR Rotation (left-right)'; node.left = rotateLeft(node.left); return rotateRight(node);
      }
      if (bf < -1) {
        if (balanceFactor(node.right) <= 0) { lastRotation = 'LL Rotation (single left)'; return rotateLeft(node); }
        lastRotation = 'RL Rotation (right-left)'; node.right = rotateRight(node.right); return rotateLeft(node);
      }
      return node;
    }

    function height(node) { return node ? 1 + Math.max(height(node.left), height(node.right)) : 0; }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Insert / Delete / Search');
      const val = makeInput('value', 'number');
      g1.appendChild(makeLabel('Value')); g1.appendChild(val);
      g1.appendChild(makeOpBtn('Insert', () => {
        if (val.value === '') return;
        lastRotation = '';
        root = insertNode(root, Number(val.value));
        renderTree(root);
        Console.log(`INSERT(${val.value})${lastRotation ? ' → ' + lastRotation : ' → no rotation needed'}`, 'O(log n)', 'O(1)');
      }));
      g1.appendChild(makeOpBtn('Delete', () => {
        if (val.value === '') return;
        lastRotation = '';
        root = deleteNode(root, Number(val.value));
        renderTree(root);
        Console.log(`DELETE(${val.value})${lastRotation ? ' → ' + lastRotation : ''}`, 'O(log n)', 'O(1)');
      }, { danger: true }));
      g1.appendChild(makeOpBtn('Search', () => {
        if (val.value === '') return;
        const target = Number(val.value);
        let cur = root;
        while (cur) { if (cur.val === target) break; cur = target < cur.val ? cur.left : cur.right; }
        renderTree(root, cur ? { active: cur } : {});
        Console.log(`SEARCH(${val.value}) → ${cur ? 'found' : 'not found'}`, 'O(log n)', 'O(1)');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Properties');
      g2.appendChild(makeOpBtn('Height', () => Console.log(`HEIGHT() → ${height(root)} (always O(log n) — that's the AVL guarantee)`, 'O(1)', 'O(1)')));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Rotations (manual demo)');
      g3.appendChild(makeOpBtn('Force imbalance + rebalance', () => {
        lastRotation = '';
        [Math.random() * 100 | 0, Math.random() * 100 | 0, Math.random() * 100 | 0].forEach(v => { root = insertNode(root, v); });
        renderTree(root);
        Console.log(`Inserted 3 random values${lastRotation ? ' → last rotation: ' + lastRotation : ''}`, 'O(log n)', 'O(1)');
      }));
      controlsBody.appendChild(g3);

      const g4 = makeGroup('Other');
      g4.appendChild(makeOpBtn('Clear', () => { root = null; renderTree(root); Console.log('CLEAR()', 'O(1)', 'O(1)'); }, { danger: true }));
      controlsBody.appendChild(g4);
    }

    return {
      init() {
        [30, 20, 40, 10, 25, 35, 50].forEach(v => { root = insertNode(root, v); });
        renderControls(); renderTree(root);
        Console.log('AVL tree initialized (self-balancing)', 'O(1)', 'O(n)');
      }
    };
  });
})();

/* ===========================================================
   7j. HEAP MODULES (min / max) — array-backed, rendered as tree
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, makeInput, makeLabel, controlsBody, Console, sleep, vizStage, el, emptyStage } = window.__DSA.Helpers;
  const { renderTree } = window.__DSA.TreeRenderer;

  function arrToTreeNodes(arr) {
    if (!arr.length) return [];
    const nodes = arr.map(v => ({ val: v, left: null, right: null }));
    for (let i = 0; i < arr.length; i++) {
      const li = 2 * i + 1, ri = 2 * i + 2;
      if (li < arr.length) nodes[i].left = nodes[li];
      if (ri < arr.length) nodes[i].right = nodes[ri];
    }
    return nodes;
  }

  function makeHeapModule(kind) {
    const isMin = kind === 'min';
    const better = (a, b) => isMin ? a < b : a > b;

    return () => {
      let arr = isMin ? [5, 12, 8, 20, 14, 16] : [20, 12, 16, 5, 14, 8];

      function renderArr(highlightIdx = {}) {
        const nodes = arrToTreeNodes(arr);
        const root = nodes[0] || null;
        const highlight = {};
        if (highlightIdx.active !== undefined && nodes[highlightIdx.active]) highlight.active = nodes[highlightIdx.active];
        if (highlightIdx.compare !== undefined && nodes[highlightIdx.compare]) highlight.compare = nodes[highlightIdx.compare];
        renderTree(root, highlight);
        Console.setState('array: [ ' + arr.join(', ') + ' ]');
      }

      async function siftUp(i) {
        while (i > 0) {
          const parent = Math.floor((i - 1) / 2);
          renderArr({ active: i, compare: parent });
          Console.log(`HEAPIFY_UP: compare index ${i} (${arr[i]}) with parent ${parent} (${arr[parent]})`, 'O(log n)', 'O(1)');
          await sleep(380);
          if (better(arr[i], arr[parent])) {
            [arr[i], arr[parent]] = [arr[parent], arr[i]];
            i = parent;
          } else break;
        }
        renderArr();
      }

      async function siftDown(i) {
        const n = arr.length;
        while (true) {
          const l = 2 * i + 1, r = 2 * i + 2;
          let target = i;
          if (l < n && better(arr[l], arr[target])) target = l;
          if (r < n && better(arr[r], arr[target])) target = r;
          renderArr({ active: i, compare: target });
          Console.log(`HEAPIFY_DOWN: at index ${i} (${arr[i]})`, 'O(log n)', 'O(1)');
          await sleep(380);
          if (target === i) break;
          [arr[i], arr[target]] = [arr[target], arr[i]];
          i = target;
        }
        renderArr();
      }

      function renderControls() {
        controlsBody.innerHTML = '';
        const g1 = makeGroup('Insert');
        const val = makeInput('value', 'number');
        g1.appendChild(makeLabel('Value')); g1.appendChild(val);
        g1.appendChild(makeOpBtn('Insert', async () => {
          if (val.value === '') return;
          arr.push(Number(val.value));
          Console.log(`INSERT(${val.value}) → appended at index ${arr.length - 1}`, 'O(log n)', 'O(1)');
          await siftUp(arr.length - 1);
        }));
        controlsBody.appendChild(g1);

        const g2 = makeGroup('Remove');
        g2.appendChild(makeOpBtn(`Extract ${isMin ? 'Min' : 'Max'}`, async () => {
          if (!arr.length) { Console.log('EXTRACT() → heap is empty', 'O(log n)', 'O(1)'); return; }
          const top = arr[0];
          renderArr({ active: 0 });
          Console.log(`EXTRACT_${isMin ? 'MIN' : 'MAX'}() → ${top}`, 'O(log n)', 'O(1)');
          await sleep(350);
          const last = arr.pop();
          if (arr.length) { arr[0] = last; await siftDown(0); } else renderArr();
        }, { danger: true }));
        g2.appendChild(makeOpBtn('Delete Root', async () => {
          if (!arr.length) return;
          const last = arr.pop();
          if (arr.length) { arr[0] = last; await siftDown(0); } else renderArr();
          Console.log('DELETE_ROOT()', 'O(log n)', 'O(1)');
        }, { danger: true }));
        controlsBody.appendChild(g2);

        const g3 = makeGroup('Other');
        g3.appendChild(makeOpBtn('Heapify (rebuild)', async () => {
          for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) await siftDown(i);
          Console.log('HEAPIFY() → rebuilt heap order', 'O(n)', 'O(1)');
        }));
        g3.appendChild(makeOpBtn('Clear', () => { arr = []; renderArr(); Console.log('CLEAR()', 'O(1)', 'O(1)'); }, { danger: true }));
        controlsBody.appendChild(g3);
      }

      return {
        init() { renderControls(); renderArr(); Console.log(`${isMin ? 'Min' : 'Max'} heap initialized`, 'O(1)', 'O(n)'); }
      };
    };
  }

  window.__DSA.registerModule('minHeap', makeHeapModule('min'));
  window.__DSA.registerModule('maxHeap', makeHeapModule('max'));
})();

/* ===========================================================
   7k. TRIE MODULE
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, makeInput, makeLabel, controlsBody, Console, sleep, vizStage } = window.__DSA.Helpers;

  window.__DSA.registerModule('trie', () => {
    const root = { ch: '•', children: {}, end: false };

    function insertWord(word) {
      let cur = root;
      for (const c of word) {
        if (!cur.children[c]) cur.children[c] = { ch: c, children: {}, end: false };
        cur = cur.children[c];
      }
      cur.end = true;
    }

    function searchWord(word) {
      let cur = root;
      for (const c of word) { if (!cur.children[c]) return null; cur = cur.children[c]; }
      return cur.end ? cur : (cur ? 'prefix' : null);
    }

    function deleteWord(word) {
      let cur = root;
      const path = [cur];
      for (const c of word) { if (!cur.children[c]) return false; cur = cur.children[c]; path.push(cur); }
      if (!cur.end) return false;
      cur.end = false;
      for (let i = path.length - 1; i > 0; i--) {
        const node = path[i], parent = path[i - 1];
        if (!node.end && Object.keys(node.children).length === 0) delete parent.children[node.ch];
        else break;
      }
      return true;
    }

    function layout() {
      let counter = 0;
      const nodes = [], edges = [];
      function assign(node, depth) {
        const ownX = node._assignedLeaf ? node._x : null;
        const keys = Object.keys(node.children);
        if (keys.length === 0) { node._x = counter++; }
        else {
          let minX = Infinity, maxX = -Infinity;
          keys.forEach(k => { assign(node.children[k], depth + 1); minX = Math.min(minX, node.children[k]._x); maxX = Math.max(maxX, node.children[k]._x); });
          node._x = (minX + maxX) / 2;
        }
        node._y = depth;
      }
      assign(root, 0);
      const spacingX = 56, spacingY = 70, padX = 40, padY = 40;
      function collect(node) {
        const x = padX + node._x * spacingX, y = padY + node._y * spacingY;
        node.x = x; node.y = y;
        nodes.push(node);
        Object.values(node.children).forEach(child => { edges.push([x, y, child]); collect(child); });
      }
      collect(root);
      const width = padX * 2 + (counter || 1) * spacingX;
      const maxDepth = Math.max(...nodes.map(n => n._y));
      const height = padY * 2 + (maxDepth + 1) * spacingY;
      return { nodes, edges, width: Math.max(width, 300), height: Math.max(height, 220) };
    }

    function render(highlightPath = new Set(), activeNode = null) {
      vizStage.innerHTML = '';
      const { nodes, edges, width, height } = layout();
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('class', 'svg-stage');
      svg.style.maxWidth = width + 'px';

      edges.forEach(([x1, y1, child]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', `M${x1},${y1} L${child.x},${child.y}`);
        line.setAttribute('class', 'tree-edge' + (highlightPath.has(child) ? ' active' : ''));
        svg.appendChild(line);
      });

      nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        let cls = 'tree-node';
        if (node === activeNode) cls += ' active';
        else if (highlightPath.has(node)) cls += ' visited';
        g.setAttribute('class', cls);
        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', node.x); shape.setAttribute('cy', node.y); shape.setAttribute('r', node.end ? 18 : 16);
        if (node.end) shape.style.strokeWidth = '3';
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x); text.setAttribute('y', node.y + 1);
        text.textContent = node.ch;
        g.appendChild(shape); g.appendChild(text);
        svg.appendChild(g);
      });
      vizStage.appendChild(svg);

      const words = [];
      function dfs(node, prefix) {
        if (node.end) words.push(prefix);
        Object.entries(node.children).forEach(([c, child]) => dfs(child, prefix + c));
      }
      dfs(root, '');
      Console.setState('words: [ ' + words.join(', ') + ' ]');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Insert / Delete');
      const word = makeInput('word (lowercase)', 'text');
      g1.appendChild(makeLabel('Word')); g1.appendChild(word);
      g1.appendChild(makeOpBtn('Insert Word', () => {
        const w = word.value.trim().toLowerCase(); if (!w) return;
        insertWord(w); render();
        Console.log(`INSERT_WORD("${w}")`, 'O(L)', 'O(L)');
      }));
      g1.appendChild(makeOpBtn('Delete Word', () => {
        const w = word.value.trim().toLowerCase(); if (!w) return;
        const ok = deleteWord(w); render();
        Console.log(`DELETE_WORD("${w}") → ${ok ? 'removed' : 'not found'}`, 'O(L)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Search');
      const searchIn = makeInput('word or prefix', 'text');
      g2.appendChild(makeLabel('Word / Prefix')); g2.appendChild(searchIn);
      g2.appendChild(makeOpBtn('Search Word', () => {
        const w = searchIn.value.trim().toLowerCase(); if (!w) return;
        const result = searchWord(w);
        let cur = root; const path = new Set();
        for (const c of w) { if (!cur.children[c]) break; cur = cur.children[c]; path.add(cur); }
        render(path, result && result !== 'prefix' ? cur : null);
        Console.log(`SEARCH_WORD("${w}") → ${result === null ? 'not found' : result === 'prefix' ? 'exists only as prefix' : 'found as complete word'}`, 'O(L)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Prefix Search', () => {
        const w = searchIn.value.trim().toLowerCase(); if (!w) return;
        let cur = root; const path = new Set(); let ok = true;
        for (const c of w) { if (!cur.children[c]) { ok = false; break; } cur = cur.children[c]; path.add(cur); }
        render(path);
        Console.log(`PREFIX_SEARCH("${w}") → ${ok ? 'prefix exists' : 'no words with this prefix'}`, 'O(L)', 'O(1)');
      }));
      controlsBody.appendChild(g2);
    }

    return {
      init() {
        ['cat', 'car', 'card', 'care', 'dog'].forEach(insertWord);
        renderControls(); render();
        Console.log('Trie initialized', 'O(1)', 'O(ALPHABET·N·L)');
      }
    };
  });
})();

/* ===========================================================
   7l. GRAPH MODULE (BFS / DFS)
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, makeInput, makeLabel, controlsBody, Console, sleep, vizStage } = window.__DSA.Helpers;

  window.__DSA.registerModule('graph', () => {
    let vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
    let adj = { A: ['B', 'C'], B: ['A', 'D'], C: ['A', 'E'], D: ['B', 'F'], E: ['C', 'F'], F: ['D', 'E'] };
    let positions = {};

    function layoutCircular() {
      const cx = 200, cy = 180, r = 130;
      vertices.forEach((v, i) => {
        const angle = (i / vertices.length) * 2 * Math.PI - Math.PI / 2;
        positions[v] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      });
    }

    function render(highlight = {}) {
      layoutCircular();
      vizStage.innerHTML = '';
      const width = 420, height = 380;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('class', 'svg-stage');

      const drawn = new Set();
      vertices.forEach(v => {
        (adj[v] || []).forEach(u => {
          const key = [v, u].sort().join('-');
          if (drawn.has(key)) return;
          drawn.add(key);
          const a = positions[v], b = positions[u];
          if (!a || !b) return;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          line.setAttribute('d', `M${a.x},${a.y} L${b.x},${b.y}`);
          let cls = 'tree-edge';
          if (highlight.activeEdges && highlight.activeEdges.has(key)) cls += ' active';
          else if (highlight.visitedEdges && highlight.visitedEdges.has(key)) cls += ' visited';
          line.setAttribute('class', cls);
          svg.appendChild(line);
        });
      });

      vertices.forEach(v => {
        const pos = positions[v]; if (!pos) return;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        let cls = 'tree-node';
        if (highlight.active === v) cls += ' active';
        else if (highlight.compare === v) cls += ' compare';
        else if (highlight.visited && highlight.visited.has(v)) cls += ' visited';
        g.setAttribute('class', cls);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x); circle.setAttribute('cy', pos.y); circle.setAttribute('r', 20);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x); text.setAttribute('y', pos.y + 1);
        text.textContent = v;
        g.appendChild(circle); g.appendChild(text);
        svg.appendChild(g);
      });
      vizStage.appendChild(svg);
      Console.setState('vertices: [ ' + vertices.join(', ') + ' ]  edges: ' + drawn.size);
    }

    async function bfs(start) {
      if (!vertices.includes(start)) { Console.log(`BFS(${start}) → vertex not found`, 'O(V+E)', 'O(V)'); return; }
      const visited = new Set([start]);
      const order = [start];
      const q = [start];
      const visitedEdges = new Set();
      render({ active: start, visited });
      Console.log(`BFS: start at ${start}`, 'O(V+E)', 'O(V)');
      await sleep(450);
      while (q.length) {
        const cur = q.shift();
        for (const nb of (adj[cur] || [])) {
          if (!visited.has(nb)) {
            visited.add(nb); order.push(nb); q.push(nb);
            const key = [cur, nb].sort().join('-'); visitedEdges.add(key);
            render({ active: nb, visited: new Set(visited), visitedEdges: new Set(visitedEdges) });
            Console.log(`BFS: visiting ${nb} (from ${cur})`, 'O(V+E)', 'O(V)');
            await sleep(450);
          }
        }
      }
      render({ visited: new Set(visited), visitedEdges });
      Console.log(`BFS(${start}) complete → order: [ ${order.join(', ')} ]`, 'O(V+E)', 'O(V)');
    }

    async function dfs(start) {
      if (!vertices.includes(start)) { Console.log(`DFS(${start}) → vertex not found`, 'O(V+E)', 'O(V)'); return; }
      const visited = new Set(); const order = []; const visitedEdges = new Set();
      async function visit(v, from) {
        visited.add(v); order.push(v);
        if (from) visitedEdges.add([from, v].sort().join('-'));
        render({ active: v, visited: new Set(visited), visitedEdges: new Set(visitedEdges) });
        Console.log(`DFS: visiting ${v}${from ? ' (from ' + from + ')' : ''}`, 'O(V+E)', 'O(V)');
        await sleep(450);
        for (const nb of (adj[v] || [])) if (!visited.has(nb)) await visit(nb, v);
      }
      await visit(start, null);
      render({ visited, visitedEdges });
      Console.log(`DFS(${start}) complete → order: [ ${order.join(', ')} ]`, 'O(V+E)', 'O(V)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Vertices');
      const vIn = makeInput('vertex label, e.g. G', 'text');
      g1.appendChild(makeLabel('Label')); g1.appendChild(vIn);
      g1.appendChild(makeOpBtn('Add Vertex', () => {
        const v = vIn.value.trim().toUpperCase(); if (!v || vertices.includes(v)) return;
        vertices.push(v); adj[v] = []; render();
        Console.log(`ADD_VERTEX(${v})`, 'O(1)', 'O(1)');
      }));
      g1.appendChild(makeOpBtn('Remove Vertex', () => {
        const v = vIn.value.trim().toUpperCase(); if (!vertices.includes(v)) return;
        vertices = vertices.filter(x => x !== v); delete adj[v];
        Object.keys(adj).forEach(k => adj[k] = adj[k].filter(x => x !== v));
        render();
        Console.log(`REMOVE_VERTEX(${v})`, 'O(V+E)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Edges');
      const e1 = makeInput('from', 'text'); const e2 = makeInput('to', 'text');
      g2.appendChild(makeLabel('From → To'));
      const row = document.createElement('div'); row.className = 'input-row'; row.appendChild(e1); row.appendChild(e2); g2.appendChild(row);
      g2.appendChild(makeOpBtn('Add Edge', () => {
        const a = e1.value.trim().toUpperCase(), b = e2.value.trim().toUpperCase();
        if (!vertices.includes(a) || !vertices.includes(b)) return;
        if (!adj[a].includes(b)) adj[a].push(b);
        if (!adj[b].includes(a)) adj[b].push(a);
        render();
        Console.log(`ADD_EDGE(${a}, ${b})`, 'O(1)', 'O(1)');
      }));
      g2.appendChild(makeOpBtn('Remove Edge', () => {
        const a = e1.value.trim().toUpperCase(), b = e2.value.trim().toUpperCase();
        if (!adj[a] || !adj[b]) return;
        adj[a] = adj[a].filter(x => x !== b); adj[b] = adj[b].filter(x => x !== a);
        render();
        Console.log(`REMOVE_EDGE(${a}, ${b})`, 'O(E)', 'O(1)');
      }, { danger: true }));
      controlsBody.appendChild(g2);

      const g3 = makeGroup('Traversal');
      const startIn = makeInput('start vertex', 'text');
      g3.appendChild(makeLabel('Start Vertex')); g3.appendChild(startIn);
      g3.appendChild(makeOpBtn('BFS', () => bfs(startIn.value.trim().toUpperCase() || vertices[0])));
      g3.appendChild(makeOpBtn('DFS', () => dfs(startIn.value.trim().toUpperCase() || vertices[0])));
      controlsBody.appendChild(g3);
    }

    return {
      init() { renderControls(); render(); Console.log('Graph initialized', 'O(1)', 'O(V+E)'); }
    };
  });
})();

/* ===========================================================
   7m. SORTING ALGORITHMS — shared engine + per-algorithm generators
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, controlsBody, vizStage, el, Console, sleep } = window.__DSA.Helpers;

  function makeSortModule(name, complexityTime, complexitySpace, genFn) {
    return () => {
      let arr = [];
      let playing = false, paused = false, speed = 5;
      let stopped = true;

      function randomArray(n = 14) { return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10); }

      function renderBars(states = {}) {
        vizStage.innerHTML = '';
        const wrap = el('div', 'bars-row');
        const maxVal = Math.max(...arr, 10);
        arr.forEach((v, i) => {
          const bar = el('div', 'bar');
          const heightPct = 18 + (v / maxVal) * 75;
          bar.style.height = heightPct + '%';
          if (states.compare && states.compare.includes(i)) bar.classList.add('compare');
          if (states.swap && states.swap.includes(i)) bar.classList.add('swap');
          if (states.sorted && states.sorted.includes(i)) bar.classList.add('sorted');
          if (states.pivot === i) bar.classList.add('pivot');
          bar.appendChild(el('span', 'bar-label', v));
          wrap.appendChild(bar);
        });
        vizStage.appendChild(wrap);
        Console.setState('[ ' + arr.join(', ') + ' ]');
      }

      function delayMs() { return 620 - speed * 55; } // speed 1..10

      async function waitIfPaused() {
        while (paused) await sleep(80);
      }

      async function runSort() {
        playing = true; stopped = false;
        const gen = genFn(arr);
        for (const step of gen) {
          if (stopped) return;
          await waitIfPaused();
          if (stopped) return;
          renderBars(step.states || {});
          if (step.log) Console.log(step.log, complexityTime, complexitySpace);
          await sleep(delayMs());
        }
        renderBars({ sorted: arr.map((_, i) => i) });
        Console.log(`${name} complete → [ ${arr.join(', ')} ]`, complexityTime, complexitySpace);
        playing = false;
      }

      function renderControls() {
        controlsBody.innerHTML = '';
        const g1 = makeGroup('Setup');
        g1.appendChild(makeOpBtn('Generate New Array', () => {
          stopped = true; playing = false; paused = false;
          arr = randomArray();
          renderBars();
          Console.log('GENERATE_ARRAY()', '—', '—');
        }));
        controlsBody.appendChild(g1);

        const g2 = makeGroup('Playback');
        const row = el('div', 'btn-row');
        const startBtn = makeOpBtn('Start', () => { if (!playing) runSort(); });
        const pauseBtn = makeOpBtn('Pause', () => { paused = true; });
        const resumeBtn = makeOpBtn('Resume', () => { paused = false; });
        const resetBtn = makeOpBtn('Reset', () => {
          stopped = true; playing = false; paused = false;
          arr = randomArray(); renderBars();
          Console.log('RESET()', '—', '—');
        }, { danger: true });
        [startBtn, pauseBtn, resumeBtn, resetBtn].forEach(b => row.appendChild(b));
        g2.appendChild(row);

        const speedRow = el('div', 'speed-row');
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range'; speedSlider.min = '1'; speedSlider.max = '10'; speedSlider.value = speed;
        speedSlider.addEventListener('input', () => { speed = Number(speedSlider.value); });
        const speedLabel = el('span', '', 'Speed');
        speedLabel.style.fontSize = '12px'; speedLabel.style.color = 'var(--text-faint)'; speedLabel.style.fontFamily = 'var(--font-mono)';
        speedRow.appendChild(speedLabel); speedRow.appendChild(speedSlider);
        g2.appendChild(speedRow);
        controlsBody.appendChild(g2);
      }

      return {
        init() {
          arr = randomArray();
          renderControls(); renderBars();
          Console.log(`${name} ready — generate or start sorting`, complexityTime, complexitySpace);
        },
        destroy() { stopped = true; playing = false; }
      };
    };
  }

  // --- Bubble Sort ---
  function* bubbleGen(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        yield { states: { compare: [j, j + 1] }, log: `Compare index ${j} (${arr[j]}) and ${j + 1} (${arr[j + 1]})` };
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          yield { states: { swap: [j, j + 1] }, log: `Swap index ${j} and ${j + 1}` };
        }
      }
      yield { states: { sorted: Array.from({ length: i + 1 }, (_, k) => arr.length - 1 - k) }, log: `Pass ${i + 1} complete` };
    }
  }
  window.__DSA.registerModule('bubbleSort', makeSortModule('Bubble Sort', 'O(n²)', 'O(1)', bubbleGen));

  // --- Selection Sort ---
  function* selectionGen(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        yield { states: { compare: [minIdx, j], sorted: Array.from({ length: i }, (_, k) => k) }, log: `Compare current min (${arr[minIdx]}) with index ${j} (${arr[j]})` };
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        yield { states: { swap: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k) }, log: `Swap index ${i} and ${minIdx}` };
      }
    }
  }
  window.__DSA.registerModule('selectionSort', makeSortModule('Selection Sort', 'O(n²)', 'O(1)', selectionGen));

  // --- Insertion Sort ---
  function* insertionGen(arr) {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
      let j = i;
      yield { states: { compare: [j] }, log: `Pick index ${i} (${arr[i]}) to insert` };
      while (j > 0 && arr[j - 1] > arr[j]) {
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        yield { states: { swap: [j, j - 1] }, log: `Shift left: swap index ${j} and ${j - 1}` };
        j--;
      }
    }
  }
  window.__DSA.registerModule('insertionSort', makeSortModule('Insertion Sort', 'O(n²)', 'O(1)', insertionGen));

  // --- Merge Sort ---
  function* mergeGen(arr) {
    function* mergeSortRec(lo, hi) {
      if (hi - lo <= 1) return;
      const mid = Math.floor((lo + hi) / 2);
      yield* mergeSortRec(lo, mid);
      yield* mergeSortRec(mid, hi);
      const left = arr.slice(lo, mid), right = arr.slice(mid, hi);
      let i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) {
        yield { states: { compare: [lo + i, mid + j] }, log: `Merge: compare ${left[i]} and ${right[j]}` };
        if (left[i] <= right[j]) { arr[k] = left[i]; i++; } else { arr[k] = right[j]; j++; }
        yield { states: { swap: [k] }, log: `Place ${arr[k]} at index ${k}` };
        k++;
      }
      while (i < left.length) { arr[k] = left[i]; yield { states: { swap: [k] }, log: `Place ${arr[k]} at index ${k}` }; i++; k++; }
      while (j < right.length) { arr[k] = right[j]; yield { states: { swap: [k] }, log: `Place ${arr[k]} at index ${k}` }; j++; k++; }
    }
    yield* mergeSortRec(0, arr.length);
  }
  window.__DSA.registerModule('mergeSort', makeSortModule('Merge Sort', 'O(n log n)', 'O(n)', mergeGen));

  // --- Quick Sort ---
  function* quickGen(arr) {
    function* qs(lo, hi) {
      if (lo >= hi) return;
      const pivot = arr[hi];
      let i = lo;
      yield { states: { pivot: hi }, log: `Pivot = ${pivot} (index ${hi})` };
      for (let j = lo; j < hi; j++) {
        yield { states: { compare: [j], pivot: hi }, log: `Compare index ${j} (${arr[j]}) with pivot ${pivot}` };
        if (arr[j] < pivot) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          yield { states: { swap: [i, j], pivot: hi }, log: `Swap index ${i} and ${j}` };
          i++;
        }
      }
      [arr[i], arr[hi]] = [arr[hi], arr[i]];
      yield { states: { swap: [i, hi] }, log: `Place pivot at index ${i}` };
      yield* qs(lo, i - 1);
      yield* qs(i + 1, hi);
    }
    yield* qs(0, arr.length - 1);
  }
  window.__DSA.registerModule('quickSort', makeSortModule('Quick Sort', 'O(n log n) avg', 'O(log n)', quickGen));

  // --- Heap Sort ---
  function* heapSortGen(arr) {
    const n = arr.length;
    function* siftDown(size, i) {
      while (true) {
        let largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < size) { yield { states: { compare: [largest, l] }, log: `Compare index ${largest} and ${l}` }; if (arr[l] > arr[largest]) largest = l; }
        if (r < size) { yield { states: { compare: [largest, r] }, log: `Compare index ${largest} and ${r}` }; if (arr[r] > arr[largest]) largest = r; }
        if (largest === i) break;
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        yield { states: { swap: [i, largest] }, log: `Swap index ${i} and ${largest}` };
        i = largest;
      }
    }
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* siftDown(n, i);
    for (let end = n - 1; end > 0; end--) {
      [arr[0], arr[end]] = [arr[end], arr[0]];
      yield { states: { swap: [0, end], sorted: Array.from({ length: n - end }, (_, k) => n - 1 - k) }, log: `Move max to index ${end}` };
      yield* siftDown(end, 0);
    }
  }
  window.__DSA.registerModule('heapSort', makeSortModule('Heap Sort', 'O(n log n)', 'O(1)', heapSortGen));
})();

/* ===========================================================
   7n. SEARCHING ALGORITHMS
=========================================================== */
(function () {
  const { makeGroup, makeOpBtn, makeInput, makeLabel, controlsBody, vizStage, el, Console, sleep } = window.__DSA.Helpers;

  function renderArrBoxes(arr, states = {}) {
    vizStage.innerHTML = '';
    const row = el('div', 'viz-row');
    arr.forEach((v, i) => {
      const box = el('div', 'box');
      if (states.compare === i) box.classList.add('compare');
      if (states.active === i) box.classList.add('active');
      if (states.excluded && states.excluded.includes(i)) box.style.opacity = '0.25';
      box.innerHTML = `${v}<span class="box-index">${i}</span>`;
      row.appendChild(box);
    });
    vizStage.appendChild(row);
    Console.setState('[ ' + arr.join(', ') + ' ]');
  }

  // --- Linear Search ---
  window.__DSA.registerModule('linearSearch', () => {
    let arr = [8, 23, 4, 19, 11, 56, 3, 31];
    let stopped = true;

    async function run(target) {
      stopped = false;
      for (let i = 0; i < arr.length; i++) {
        if (stopped) return;
        renderArrBoxes(arr, { compare: i });
        Console.log(`LINEAR_SEARCH: checking index ${i} (${arr[i]})`, 'O(n)', 'O(1)');
        await sleep(450);
        if (arr[i] === target) {
          renderArrBoxes(arr, { active: i });
          Console.log(`LINEAR_SEARCH(${target}) → found at index ${i}`, 'O(n)', 'O(1)');
          return;
        }
      }
      renderArrBoxes(arr);
      Console.log(`LINEAR_SEARCH(${target}) → not found`, 'O(n)', 'O(1)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const g1 = makeGroup('Setup');
      g1.appendChild(makeOpBtn('Generate New Array', () => {
        stopped = true;
        arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 1);
        renderArrBoxes(arr);
        Console.log('GENERATE_ARRAY()', '—', '—');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Search');
      const target = makeInput('value to find', 'number');
      g2.appendChild(makeLabel('Target value')); g2.appendChild(target);
      g2.appendChild(makeOpBtn('Search', () => { if (target.value !== '') run(Number(target.value)); }));
      controlsBody.appendChild(g2);
    }

    return {
      init() { renderControls(); renderArrBoxes(arr); Console.log('Linear search ready', 'O(n)', 'O(1)'); },
      destroy() { stopped = true; }
    };
  });

  // --- Binary Search ---
  window.__DSA.registerModule('binarySearch', () => {
    let arr = [3, 8, 11, 19, 23, 31, 42, 56];
    let stopped = true;

    async function run(target) {
      stopped = false;
      let lo = 0, hi = arr.length - 1;
      const excluded = [];
      while (lo <= hi) {
        if (stopped) return;
        const mid = Math.floor((lo + hi) / 2);
        renderArrBoxes(arr, { compare: mid, excluded: [...excluded] });
        Console.log(`BINARY_SEARCH: lo=${lo} hi=${hi} mid=${mid} (${arr[mid]})`, 'O(log n)', 'O(1)');
        await sleep(550);
        if (arr[mid] === target) {
          renderArrBoxes(arr, { active: mid, excluded: [...excluded] });
          Console.log(`BINARY_SEARCH(${target}) → found at index ${mid}`, 'O(log n)', 'O(1)');
          return;
        } else if (arr[mid] < target) {
          for (let k = lo; k <= mid; k++) excluded.push(k);
          lo = mid + 1;
        } else {
          for (let k = mid; k <= hi; k++) excluded.push(k);
          hi = mid - 1;
        }
      }
      renderArrBoxes(arr, { excluded });
      Console.log(`BINARY_SEARCH(${target}) → not found`, 'O(log n)', 'O(1)');
    }

    function renderControls() {
      controlsBody.innerHTML = '';
      const note = el('div', '', '<p style="font-size:12.5px;">Binary search requires a sorted array — array is kept sorted automatically.</p>');
      controlsBody.appendChild(note);

      const g1 = makeGroup('Setup');
      g1.appendChild(makeOpBtn('Generate New Array', () => {
        stopped = true;
        arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 1).sort((a, b) => a - b);
        renderArrBoxes(arr);
        Console.log('GENERATE_ARRAY() (sorted)', '—', '—');
      }));
      controlsBody.appendChild(g1);

      const g2 = makeGroup('Search');
      const target = makeInput('value to find', 'number');
      g2.appendChild(makeLabel('Target value')); g2.appendChild(target);
      g2.appendChild(makeOpBtn('Search', () => { if (target.value !== '') run(Number(target.value)); }));
      controlsBody.appendChild(g2);
    }

    return {
      init() { renderControls(); renderArrBoxes(arr); Console.log('Binary search ready (array sorted)', 'O(log n)', 'O(1)'); },
      destroy() { stopped = true; }
    };
  });
})();

/* ===========================================================
   8. COMPLEXITY ANALYZER
=========================================================== */
(function () {
  const root = document.documentElement;
  const slider = document.getElementById('nSlider');
  const nValue = document.getElementById('nValue');
  const nValue2 = document.getElementById('nValue2');
  const canvas = document.getElementById('complexityCanvas');
  const legendEl = document.getElementById('complexityLegend');
  const tableEl = document.getElementById('complexityTable');

  const SERIES = [
    { key: 'O(1)', color: '#2DD4BF', fn: () => 1 },
    { key: 'O(log n)', color: '#A78BFA', fn: n => Math.log2(Math.max(n, 1)) },
    { key: 'O(n)', color: '#FBBF24', fn: n => n },
    { key: 'O(n log n)', color: '#60A5FA', fn: n => n * Math.log2(Math.max(n, 1)) },
    { key: 'O(n²)', color: '#FB923C', fn: n => n * n },
    { key: 'O(2ⁿ)', color: '#FB7185', fn: n => Math.pow(2, n) }
  ];

  let initialized = false;

  function buildLegend() {
    legendEl.innerHTML = '';
    SERIES.forEach(s => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-dot" style="background:${s.color}"></span>${s.key}`;
      legendEl.appendChild(item);
    });
  }

  function buildTable(n) {
    tableEl.innerHTML = '';
    SERIES.forEach(s => {
      const row = document.createElement('div');
      row.className = 'complexity-row';
      const count = s.fn(n);
      const display = count > 999999 ? count.toExponential(2) : Math.round(count).toLocaleString();
      row.innerHTML = `<span class="c-label">${s.key}</span><span class="c-count" style="color:${s.color}">${display}</span>`;
      tableEl.appendChild(row);
    });
  }

  function drawGraph(maxN) {
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const padL = 50 * devicePixelRatio, padB = 30 * devicePixelRatio, padT = 16 * devicePixelRatio, padR = 16 * devicePixelRatio;
    const plotW = W - padL - padR, plotH = H - padT - padB;

    // compute max Y across visible series (cap O(2^n) influence by clipping)
    let maxY = 0;
    const pointsBySeries = SERIES.map(s => {
      const pts = [];
      for (let n = 1; n <= maxN; n++) pts.push(s.fn(n));
      return pts;
    });
    // To keep the graph readable, clip y at the n^2 scale unless maxN is tiny (2^n explodes fast)
    const n2Max = maxN * maxN;
    maxY = n2Max * 1.15;

    const isLight = root.getAttribute('data-theme') === 'light';
    const gridColor = isLight ? 'rgba(15,20,30,0.08)' : 'rgba(255,255,255,0.08)';
    const textColor = isLight ? '#565D6E' : '#9AA1B2';

    // grid lines
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1 * devicePixelRatio;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    }

    function xPos(n) { return padL + ((n - 1) / Math.max(maxN - 1, 1)) * plotW; }
    function yPos(v) { return padT + plotH - (Math.min(v, maxY) / maxY) * plotH; }

    SERIES.forEach((s, idx) => {
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.4 * devicePixelRatio;
      pointsBySeries[idx].forEach((v, i) => {
        const n = i + 1;
        const x = xPos(n), y = yPos(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // endpoint dot
      const lastVal = pointsBySeries[idx][pointsBySeries[idx].length - 1];
      ctx.beginPath();
      ctx.fillStyle = s.color;
      ctx.arc(xPos(maxN), yPos(lastVal), 4 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });

    // axis labels
    ctx.fillStyle = textColor;
    ctx.font = `${11 * devicePixelRatio}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('N = ' + maxN, padL + plotW / 2, H - 6 * devicePixelRatio);
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillText('operations', padL - 6 * devicePixelRatio, padT + 10 * devicePixelRatio);
    ctx.restore();
  }

  function update() {
    const n = Number(slider.value);
    nValue.textContent = n;
    nValue2.textContent = n;
    buildTable(n);
    drawGraph(n);
  }

  window.__DSA.ComplexityAnalyzer = {
    init() {
      if (!initialized) {
        buildLegend();
        slider.addEventListener('input', update);
        window.addEventListener('resize', () => drawGraph(Number(slider.value)));
        initialized = true;
      }
      requestAnimationFrame(update);
    }
  };
})();
