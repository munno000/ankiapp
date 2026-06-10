const STORAGE_KEY = 'ankiapp_words'

function loadWords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch (e) {
    return []
  }
}

function saveWords(words) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
}

function renderList() {
  const tbody = document.querySelector('#wordsTable tbody')
  tbody.innerHTML = ''
  const words = loadWords()
  words.forEach((w, i) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${escapeHtml(w.word)}</td>
      <td>${escapeHtml(w.meaning || '')}</td>
      <td>
        <button data-i="${i}" class="edit">編集</button>
        <button data-i="${i}" class="delete">削除</button>
      </td>
    `
    tbody.appendChild(tr)
  })
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
}

function addWord(word, meaning){
  const words = loadWords()
  words.push({word: word.trim(), meaning: meaning.trim()})
  saveWords(words)
  renderList()
}

function deleteWord(i){
  const words = loadWords()
  words.splice(i,1)
  saveWords(words)
  renderList()
}

function editWord(i){
  const words = loadWords()
  const w = words[i]
  const newWord = prompt('英単語を編集', w.word)
  if (newWord == null) return
  const newMeaning = prompt('意味 / 例を編集', w.meaning || '')
  if (newMeaning == null) return
  words[i] = {word: newWord.trim(), meaning: newMeaning.trim()}
  saveWords(words)
  renderList()
}

function exportJson(){
  const words = loadWords()
  const blob = new Blob([JSON.stringify(words, null, 2)], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ankiapp_words.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function importJsonFile(file){
  const reader = new FileReader()
  reader.onload = e => {
    try{
      const data = JSON.parse(e.target.result)
      if (!Array.isArray(data)) throw new Error('Invalid format')
      saveWords(data.map(d=>({word:d.word||'', meaning:d.meaning||''})))
      renderList()
      alert('インポート完了')
    }catch(err){
      alert('インポートに失敗しました: ' + err.message)
    }
  }
  reader.readAsText(file)
}

// --- Quiz logic ---
let quizState = null

function startQuiz(direction){
  const words = loadWords()
  if (words.length === 0){ alert('単語がありません。まず単語を追加してください。'); return }
  quizState = {words: shuffle([...words]), idx:0, dir: direction}
  document.getElementById('quizArea').classList.remove('hidden')
  document.getElementById('startQuiz').disabled = true
  document.getElementById('stopQuiz').disabled = false
  showQuestion()
}

function stopQuiz(){
  quizState = null
  document.getElementById('quizArea').classList.add('hidden')
  document.getElementById('startQuiz').disabled = false
  document.getElementById('stopQuiz').disabled = true
  document.getElementById('feedback').textContent = ''
}

function showQuestion(){
  if (!quizState) return
  const cur = quizState.words[quizState.idx]
  const prompt = quizState.dir === 'enjp' ? cur.word : cur.meaning || ''
  document.getElementById('prompt').textContent = prompt
  document.getElementById('answer').value = ''
  document.getElementById('feedback').textContent = `(${quizState.idx+1}/${quizState.words.length})`
}

function checkAnswer(){
  if (!quizState) return
  const cur = quizState.words[quizState.idx]
  const user = document.getElementById('answer').value.trim()
  const target = quizState.dir === 'enjp' ? (cur.meaning||'') : cur.word
  const ok = normalize(user) === normalize(target)
  const feedback = document.getElementById('feedback')
  feedback.textContent = ok ? '正解！' : `不正解。答え: ${target}`
}

function showAnswer(){
  if (!quizState) return
  const cur = quizState.words[quizState.idx]
  const target = quizState.dir === 'enjp' ? (cur.meaning||'') : cur.word
  document.getElementById('feedback').textContent = `答え: ${target}`
}

function nextQuestion(){
  if (!quizState) return
  quizState.idx++
  if (quizState.idx >= quizState.words.length){
    alert('終了しました。最初からやり直します。')
    quizState.idx = 0
    quizState.words = shuffle(quizState.words)
  }
  showQuestion()
}

function normalize(s){
  return s.replace(/\s+/g,' ').trim().toLowerCase()
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]
  }
  return a
}

// --- UI wiring ---
document.addEventListener('DOMContentLoaded', ()=>{
  renderList()

  document.getElementById('addForm').addEventListener('submit', e=>{
    e.preventDefault()
    const w = document.getElementById('word').value
    const m = document.getElementById('meaning').value
    if (!w.trim()) return
    addWord(w,m)
    e.target.reset()
  })

  document.getElementById('wordsTable').addEventListener('click', e=>{
    if (e.target.classList.contains('delete')){
      const i = Number(e.target.dataset.i)
      if (confirm('削除してよいですか？')) deleteWord(i)
    }
    if (e.target.classList.contains('edit')){
      const i = Number(e.target.dataset.i)
      editWord(i)
    }
  })

  document.getElementById('exportBtn').addEventListener('click', exportJson)
  document.getElementById('importBtn').addEventListener('click', ()=> document.getElementById('importFile').click())
  document.getElementById('importFile').addEventListener('change', e=>{
    const f = e.target.files[0]
    if (f) importJsonFile(f)
    e.target.value = ''
  })
  document.getElementById('clearBtn').addEventListener('click', ()=>{
    if (!confirm('本当に全削除しますか？')) return
    saveWords([])
    renderList()
  })

  document.getElementById('startQuiz').addEventListener('click', ()=>{
    const dir = document.querySelector('input[name="dir"]:checked').value
    startQuiz(dir)
  })
  document.getElementById('stopQuiz').addEventListener('click', stopQuiz)
  document.getElementById('checkAnswer').addEventListener('click', checkAnswer)
  document.getElementById('showAnswer').addEventListener('click', showAnswer)
  document.getElementById('nextQuestion').addEventListener('click', nextQuestion)
})
