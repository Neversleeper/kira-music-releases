// The share page of Kira Music: it reads ?l=<song link>, checks that it is a song of YouTube or SoundCloud (the same rule as the app) and offers two buttons:
// one that opens the song in Kira Music (kira://play?l=...) and one that opens it on its own site. Nothing is sent anywhere and nothing is stored.
// A radio station comes as …/s/rd/<station id>?n=<its name> and opens kira://radio?u=<station id> (Kira looks it up; this page asks nobody).
(function () {
  var YT = /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/
  var SC = /^https:\/\/soundcloud\.com\/[A-Za-z0-9_-]{1,80}\/[A-Za-z0-9_-]{1,120}$/
  var TEXT = {
    es: { radio: 'Alguien te compartió una emisora de radio', radioSub: 'Ábrela en Kira Music para escucharla en vivo.', one: 'canción', many: 'canciones', title: 'Alguien te compartió una canción', sub: 'Ábrela en Kira Music para escucharla.', open: 'Abrir en Kira Music', site: 'Escucharla en su sitio', get: '¿Aún no tienes Kira Music?', getLink: 'Consíguela', bad: 'Este enlace no funciona', badSub: 'No es un enlace a una canción de YouTube o SoundCloud.' },
    pt: { radio: 'Alguém compartilhou uma rádio com você', radioSub: 'Abra no Kira Music para ouvir ao vivo.', one: 'música', many: 'músicas', title: 'Alguém compartilhou uma música com você', sub: 'Abra no Kira Music para ouvir.', open: 'Abrir no Kira Music', site: 'Ouvir no site original', get: 'Ainda não tem o Kira Music?', getLink: 'Baixar', bad: 'Este link não funciona', badSub: 'Não é um link para uma música do YouTube ou SoundCloud.' },
    fr: { radio: 'Quelqu’un a partagé une station de radio avec vous', radioSub: 'Ouvrez-la dans Kira Music pour l’écouter en direct.', one: 'chanson', many: 'chansons', title: 'Quelqu’un a partagé une chanson avec vous', sub: 'Ouvrez-la dans Kira Music pour l’écouter.', open: 'Ouvrir dans Kira Music', site: 'Écouter sur son site', get: 'Vous n’avez pas encore Kira Music ?', getLink: 'Obtenir', bad: 'Ce lien ne fonctionne pas', badSub: 'Ce n’est pas un lien vers une chanson de YouTube ou SoundCloud.' },
    tr: { radio: 'Biri seninle bir radyo istasyonu paylaştı', radioSub: 'Canlı dinlemek için Kira Music’te aç.', one: 'şarkı', many: 'şarkı', title: 'Biri seninle bir şarkı paylaştı', sub: 'Dinlemek için Kira Music’te aç.', open: 'Kira Music’te aç', site: 'Kendi sitesinde dinle', get: 'Henüz Kira Music’in yok mu?', getLink: 'İndir', bad: 'Bu bağlantı çalışmıyor', badSub: 'YouTube veya SoundCloud’daki bir şarkının bağlantısı değil.' },
    pl: { radio: 'Ktoś udostępnił Ci stację radiową', radioSub: 'Otwórz ją w Kira Music, aby słuchać na żywo.', one: 'piosenka', many: 'piosenek', title: 'Ktoś udostępnił Ci piosenkę', sub: 'Otwórz ją w Kira Music, aby posłuchać.', open: 'Otwórz w Kira Music', site: 'Posłuchaj na oryginalnej stronie', get: 'Nie masz jeszcze Kira Music?', getLink: 'Pobierz', bad: 'Ten link nie działa', badSub: 'To nie jest link do piosenki z YouTube ani SoundCloud.' }
  }
  var lang = (navigator.language || 'en').slice(0, 2)
  var t = TEXT[lang]
  function $(id) { return document.getElementById(id) }
  if (t) {
    $('t-title').textContent = t.title; $('t-sub').textContent = t.sub; $('open').textContent = t.open; $('site').textContent = t.site
    $('t-get').textContent = t.get; $('get').textContent = t.getLink; $('t-bad').textContent = t.bad; $('t-bad-sub').textContent = t.badSub
    document.documentElement.lang = lang
  }
  var params = new URLSearchParams(location.search)
  var API = 'https://hjueikpcdbogxfgekpho.supabase.co'
  var HOST = /^https:\/\/[a-z0-9-]{10,40}\.supabase\.co$/
  var CODE = /^[A-Za-z0-9]{8}$/
  function thumb(link) { var m = /^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})$/.exec(link); return m ? 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg' : '' }
  function token(link) { return YT.test(link) ? link.slice(32) : link.slice(23) }
  function show(text, sub, app, site, cover, grid) {
    $('t-title').textContent = text; $('t-sub').textContent = sub
    $('open').href = app
    if (site) { $('site').href = site } else { $('site').hidden = true }
    if (cover) { $('cover').src = cover; $('cover').hidden = false }
    if (grid && grid.length) {
      grid.forEach(function (src) { var el = src ? document.createElement('img') : document.createElement('i'); if (src) { el.src = src; el.alt = '' } $('grid').appendChild(el) })
      $('grid').hidden = false
    }
    $('ok').hidden = false
    // opens Kira by itself (the browser asks the person first); the button stays for when it does not
    setTimeout(function () { location.href = app }, 800)
  }
  var code = params.get('c') || ''
  if (code) {
    if (!CODE.test(code)) { $('bad').hidden = false; return }
    var api = params.get('a') || API
    if (!HOST.test(api)) api = API
    fetch(api + '/functions/v1/s?c=' + code).then(function (r) { return r.ok ? r.json() : Promise.reject() }).then(function (d) {
      var p = d.payload || {}
      if (d.kind === 'song' && (YT.test(p.link) || SC.test(p.link))) {
        show(String(p.title || 'A song for you').slice(0, 200), String(p.artist || '').slice(0, 120) || (t ? t.sub : 'Open it in Kira Music to listen.'), 'kira://play?l=' + encodeURIComponent(p.link), p.link, thumb(p.link), null)
      } else if (d.kind === 'playlist' && Array.isArray(p.songs)) {
        var songs = p.songs.filter(function (l) { return YT.test(l) || SC.test(l) }).slice(0, 60)
        if (!songs.length) return $('bad').hidden = false
        var name = String(p.name || 'Playlist').slice(0, 80)
        var app = 'kira://playlist?n=' + encodeURIComponent(name) + '&s=' + songs.map(token).join(',')
        show(name, songs.length + ' ' + (t ? (songs.length === 1 ? t.one : t.many) : (songs.length === 1 ? 'song' : 'songs')), app, '', '', songs.slice(0, 4).map(thumb))
      } else $('bad').hidden = false
    }).catch(function () { $('bad').hidden = false })
    return
  }
  // pretty links: [/<project>]/s/sc/<artist>/<song> and [/<project>]/s/yt/<video id> (a 404.html at the root of the site opens this same page for them; on GitHub Pages
  // the site lives under /kira-music-releases/, so the path may start with it); ?l=<song link> keeps working
  function fromPath(p) {
    var m = /^(?:\/[A-Za-z0-9_-]{1,60})?\/s\/sc\/([A-Za-z0-9_-]{1,80})\/([A-Za-z0-9_-]{1,120})\/?$/.exec(p)
    if (m) return 'https://soundcloud.com/' + m[1] + '/' + m[2]
    m = /^(?:\/[A-Za-z0-9_-]{1,60})?\/s\/yt\/([A-Za-z0-9_-]{11})\/?$/.exec(p)
    return m ? 'https://www.youtube.com/watch?v=' + m[1] : ''
  }
  // a radio station: the name travels in the link, the station is looked up by Kira itself
  var rd = /^(?:\/[A-Za-z0-9_-]{1,60})?\/s\/rd\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/.exec(location.pathname)
  if (rd) {
    var station = String(params.get('n') || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    var radioApp = 'kira://radio?u=' + rd[1]
    $('t-title').textContent = station || (t ? t.radio : 'Somebody shared a radio station with you')
    $('t-sub').textContent = station ? (t ? t.radio : 'Somebody shared a radio station with you') + '. ' + (t ? t.radioSub : 'Open it in Kira Music to listen live.') : (t ? t.radioSub : 'Open it in Kira Music to listen live.')
    $('open').href = radioApp
    $('site').hidden = true
    $('ok').hidden = false
    setTimeout(function () { location.href = radioApp }, 800)
    return
  }
  var song = params.get('l') || fromPath(location.pathname)
  if (!(YT.test(song) || SC.test(song))) { $('bad').hidden = false; return }
  var app = 'kira://play?l=' + encodeURIComponent(song)
  $('open').href = app
  $('site').href = song
  $('ok').hidden = false
  setTimeout(function () { location.href = app }, 500)
})()
