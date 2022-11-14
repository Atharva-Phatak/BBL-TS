import flask
app = flask.Flask(__name__, static_folder="templates")


@app.route("/")
def static_proxy():
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(port=8000)
