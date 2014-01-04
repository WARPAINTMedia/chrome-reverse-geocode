function ajax(addr, blob, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', addr, true);
  if (blob) {
    xhr.responseType = 'blob';
  } else {
    // Hack to pass bytes through unprocessed.
    xhr.overrideMimeType('text/plain; charset=utf-8');
  }
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      callback(this.response);
    }
  };
  xhr.send();
}

function changeMap(lat, lng) {
  var url = "http://maps.googleapis.com/maps/api/staticmap?center=" + lat + "," + lng + "&zoom=" + zoom + "&size=547x390\&markers=color:blue%7C" + lat + "," + lng + "&maptype=hybrid&sensor=false";
  ajax(url, true, function(res) {
    map.src = window.webkitURL.createObjectURL(res);
    map.style.opacity = 1;
  });
}

function empty(e) {
  for(var k in e) {
    e[k].innerText = '';
  }
}

// copy to clipboard function
function toClipboard() {
  f.focus();
  m.classList.add('in');
  if (f.value.length === 0) {
    m.innerText = 'No [Lat, Lng] to copy.';
  } else {
    document.execCommand('SelectAll');
    document.execCommand('Copy', false, null);
    m.innerText = 'Copied [Lat, Lng] to clipboard';
  }
  setTimeout(function() {
    m.classList.remove('in');
  }, 2000);
}

// do an ajax save when this input is changed
function handleInput() {
  var val = this.value;
  m.innerText = '';
  m.classList.remove('in');
  f.value = '';
  empty(elem);
  if (val.length > 3) {
    // clear the timeout so we dont fire in succession
    clearTimeout(this.delayer);
    this.delayer = setTimeout(function() {
      ajax('http://maps.googleapis.com/maps/api/geocode/json?address=' + val + '&sensor=true', false, function(res) {
        var r = JSON.parse(res);
        if (typeof(r) !== 'undefined') {
          r = r.results[0].geometry.location;
          for(var k in r) {
            elem[k].innerText = r[k];
          }
          f.value = (r.lat + ', ' + r.lng);
          lat = r.lat;
          lng = r.lng;
          changeMap(lat, lng);
        }
      });
    }, 1000);
  } else {
    m.innerText = 'At Least 3 Letters Needed';
    m.classList.add('in');
    empty(elem);
  }
}

function zoomLevel() {
  if(this.id === 'increase') {
    zoom += 1;
  } else {
    zoom -= 1;
  }
  changeMap(lat, lng);
}

var m, f, btn, map, elem = [], zoom = 18, lat, lng;

document.addEventListener('DOMContentLoaded', function() {
  m = document.getElementById('messages');
  map = document.getElementById('themap');
  f = document.getElementById('field');
  elem.lat = document.getElementById('lat');
  elem.lng = document.getElementById('lng');
  btn = document.getElementById('copy');
  btn.addEventListener('click', toClipboard);
  document.getElementById('search').addEventListener('keyup', handleInput);
  var zbtns = document.querySelectorAll('.zoom-controls a');
  for (var i = 0; i < zbtns.length; i++) {
    zbtns[i].addEventListener('click', zoomLevel);
  }
  setTimeout(function() {
    document.body.classList.add('loaded');
  }, 500);
});
