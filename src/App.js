import React from "react";
import "./App.css";
import FacebookLogin from "react-facebook-login";

const Square = ({ onClick, value }) => {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
};

class Board extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     xIsNext: true,
  //     squares: Array(9).fill(null)
  //   };
  // }

  renderSquare = i => {
    const { squares, onClick } = this.props;
    // console.log("line 23 props", this.props);
    return <Square value={squares[i]} onClick={() => onClick(i)} />;
  };

  // calculateWinner(squares) {
  //   const lines = [
  //     [0, 1, 2],
  //     [3, 4, 5],
  //     [6, 7, 8],
  //     [0, 3, 6],
  //     [1, 4, 7],
  //     [2, 5, 8],
  //     [0, 4, 8],
  //     [2, 4, 6]
  //   ];
  //   for (let i = 0; i < lines.length; i++) {
  //     const [a, b, c] = lines[i];
  //     if (
  //       squares[a] &&
  //       squares[a] === squares[b] &&
  //       squares[a] === squares[c]
  //     ) {
  //       return squares[a];
  //     }
  //   }
  //   return null;
  // }

  render() {
    // const status = "Next player: " + (this.state.xIsNext ? "X" : "0");
    // const winner = this.calculateWinner(this.state.squares);
    // let status;
    // if (winner) {
    //   status = "Winner: " + winner;
    // } else {
    //   status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    // }

    return (
      <div>
        {/* <div className="status">{status}</div> */}
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      boldStep: 0,
      xIsNext: true,
      currentUser: null,
      CdsHighScore: [],
      isError: false,
      isPosted: false
    };
  }

  componentDidMount() {
    const currentUser = localStorage.getItem("fblogin");
    if (currentUser !== null) {
      this.setState({ currentUser: JSON.parse(currentUser) });
    }
  }

  getHighScore = async () => {
    const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
    try {
      const response = await fetch(url);
      const jsonData = await response.json();
      console.log("HighScores", jsonData.items);
      this.setState({ CdsHighScore: jsonData.items });
      return jsonData;
    } catch (error) {
      this.setState({ isError: true });
      console.log("errorrrr", error);
    }
  };
  postHighScore = async () => {
    let data = new URLSearchParams();
    data.append("player", "PrimeTimeTranTran6");
    data.append("score", -1559744896);
    const url = `http://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data.toString(),
      json: true
    };
    const response = await fetch(url, config);
    if (response.status === 200) {
      this.getHighScore();
    }
  };

  handleClick = i => {
    console.log("handleClick position", i);
    // const history = this.state.history;
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }
    if (squares[i] === null) {
      squares[i] = this.state.xIsNext ? "X" : "0";
    } else {
      this.state.xIsNext = !this.state.xIsNext;
    }
    console.log("squrares", squares);
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  };

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      // console.log("line 138 line", lines[i]);
      let isSomeOneWon =
        squares[a] && squares[a] === squares[b] && squares[a] === squares[c];
      if (isSomeOneWon) {
        if (!this.state.isPosted) this.postScoreApi();
        return squares[a];
      }
    }
    return null;
  }

  jumpTo = step => {
    console.log("jumTo Step", step);
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  };

  responseFacebook = response => {
    try {
      if (response && response.status !== "unknow") {
        localStorage.setItem("fblogin", JSON.stringify(response));
        this.setState({ currentUser: response });
        console.log("currentUser", this.state.currentUser);
      }
    } catch (error) {
      console.log("errorrrr", error);
    }
  };

  onSignOut = () => {
    localStorage.removeItem("fblogin");
    this.setState({ currentUser: null });
  };

  getHighScoreApi = () => {
    console.log("getHIghSchooorerjeoi");
    this.getHighScore();
  };
  postScoreApi = () => {
    console.log("postting Score 224 lkjlkdsf");
    this.postHighScore();
    this.setState({ isPosted: true });
  };
  render() {
    const history = this.state.history;
    // const current = history[history.length - 1];
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      // console.log("steppp 162", step);
      // console.log("162 move", move);
      const desc = move ? "Go to move #" + move : "Go to game start";
      // let desc = "hello";
      return (
        <li>
          <button onClick={() => this.jumpTo(move)}>
            {/* {`step number:${this.state.stepNumber}  and ${desc}`} */}
            {this.state.stepNumber === move ? <strong>{desc}</strong> : desc}
            {/* {desc} */}
          </button>
        </li>
      );
    });

    let status;
    let xmove = current.squares.filter(i => i === "X").length;
    if (winner) {
      status = "Winner: " + winner;
      // this.postScoreApi(); create loop if post herere - post many time
    } else if (xmove === 5) {
      status = "TIE GAME";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }
    return (
      <div className="game">
        {this.state.currentUser && (
          <button onClick={() => this.onSignOut()}>Sign Out</button>
        )}
        <h3>{this.state.currentUser && this.state.currentUser.name}</h3>
        <button onClick={() => this.getHighScoreApi()}>Get Score </button>
        <button onClick={() => this.postScoreApi()}>Post Score </button>

        <ul>
          {this.state.CdsHighScore &&
            this.state.CdsHighScore.map(score => {
              return <li>{`${score.player}: ${score.score}`}</li>;
            })}
        </ul>

        {this.state.currentUser === null && (
          <FacebookLogin
            appId={process.env.REACT_APP_FACEBOOK_ID}
            autoLoad={true}
            fields="name,email,picture"
            // onClick={componentClicked}
            callback={this.responseFacebook}
          />
        )}
        {this.state.currentUser !== null && (
          <>
            <div className="game-board">
              <div className="status">{status}</div>
              <Board
                squares={current.squares}
                xIsNext={this.state.xIsNext}
                onClick={i => this.handleClick(i)}
              />
            </div>
            <div className="game-info">
              <div>{status}</div>
              <ol>{moves}</ol>
            </div>{" "}
          </>
        )}
      </div>
    );
  }
}

export default App;
