from urllib.request import urlopen, urlretrieve
import json
import random


def parse_films(url, ran):
    ids = []
    for i in range(1, ran):
        file = urlopen(url + "&page=" + str(i)).read().decode()
        arr = json.loads(file)
        for j in arr["results"]:
            ids.append(j["id"])
    return id_to_data(ids)


def id_to_data(ids):
    fullData = []
    cap = 0
    randys = []
    p = 0
    while cap < 10:
        meme = random.randint(0, len(ids))
        if ids[meme] not in randys:
            randys.append(ids[meme])
            cap = cap + 1
    while len(fullData) < 5:
        film = urlopen("https://api.themoviedb.org/3/movie/" + str(randys[p]) + "?api_key=7cd8bcd2f506e761901bec693fd1dd9c&language=en-US").read().decode()
        jso = json.loads(film)
        if int(jso["revenue"] > 0):
            src = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" + jso["poster_path"]
            urlretrieve(src, "assets/posters/poster" + str(p) + ".jpg")
            fullData.append({"title": jso["title"], "revenue": round(int(jso["revenue"]) / 1000000, 0), "year": jso["release_date"][:4], "budget": round(int(jso["budget"]) / 1000000, 0)})
        p += 1
    return fullData


def test():
    meme = []
    meme = parse_films("https://api.themoviedb.org/3/discover/movie?api_key=7cd8bcd2f506e761901bec693fd1dd9c&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&primary_release_date.gte=1990&primary_release_date.lte=2018&with_original_language=en&page=1", 20)
    return meme


# print(len(test()))
