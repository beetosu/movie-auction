
from bottle import static_file, route, run
import movies
import json


@route('/movies')
def get_films():
    url = "https://api.themoviedb.org/3/discover/movie?api_key="
    url += "7cd8bcd2f506e761901bec693fd1dd9c"
    url += "&language=en-US&sort_by=popularity.desc&include_adult=false"
    url += "&include_video=false&primary_release_date.gte=1980"
    url += "&primary_release_date.lte=2018&with_original_language=en"
    arr = movies.parse_films(url, 10)
    return json.dumps(arr)


@route('/')
def server_static():
    return static_file('/index.html', root='/projects/movies')


@route('/style.css')
def servsser_static():
    return static_file('/style.css', root='/projects/movies')


@route('/phaser.js')
def gamer():
    return static_file('/phaser.js', root='/projects/movies')


@route('/game.js')
def ayo():
    return static_file('/game.js', root='/projects/movies')


@route('/assets/posters/poster0.jpg')
def gajmer():
    return static_file('/poster0.jpg', root='/projects/movies/assets/posters')


@route('/assets/posters/poster1.jpg')
def gameor():
    return static_file('/poster1.jpg', root='/projects/movies/assets/posters')


@route('/assets/posters/poster2.jpg')
def gamooer():
    return static_file('/poster2.jpg', root='/projects/movies/assets/posters')


@route('/assets/posters/poster3.jpg')
def gauumer():
    return static_file('/poster3.jpg', root='/projects/movies/assets/posters')


@route('/assets/posters/poster4.jpg')
def gamlkjer():
    return static_file('/poster4.jpg', root='/projects/movies/assets/posters')


@route('/assets/roughstage.png')
def gawwjmelr():
    return static_file('/roughstage.png', root='/projects/movies/assets')


@route('/assets/paddles.png')
def gawwjfmer():
    return static_file('/paddles.png', root='/projects/movies/assets')


@route('/assets/cowboy.png')
def gawwjfmerg():
    return static_file('/cowboy.png', root='/projects/movies/assets')


@route('/assets/bubble.png')
def gawwjfmergs():
    return static_file('/bubble.png', root='/projects/movies/assets')


run(host='0.0.0.0', port=8080, debug=True)
