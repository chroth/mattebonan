import React, { useEffect, useRef, useState } from "react";
import range from "lodash/range";
import beans from "./beans";
import "./App.css";

const beansArray = Object.values(beans);

const GameBoard: React.FC<{
  beansBoard: Array<number>;
  setBeansBoard: React.Dispatch<React.SetStateAction<Array<number>>>;
}> = ({ beansBoard, setBeansBoard }) => {
  const addBean = (beanColour: number) => {
    setBeansBoard([...beansBoard, beanColour]);
  };
  const removeBean = (beanIndex: number) => {
    setBeansBoard(beansBoard.filter((_, index) => index !== beanIndex));
  };

  const columns = range(10);
  const rows = range(5);
  return (
    <div className="board">
      {rows.map((y) => (
        <div className="row" key={y}>
          {columns.map((x) => {
            const squareIndex = x + y * columns.length;
            const beanIndex = beansBoard[squareIndex];
            return (
              <div
                className="square"
                onClick={() => removeBean(squareIndex)}
                key={x}
              >
                {beanIndex >= 0 ? (
                  <img
                    src={beansArray[beanIndex]}
                    className="beanAsset"
                    alt="Böna"
                  />
                ) : (
                  ""
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div className="row beans">
        {range(8).map((beanIndex) => (
          <div
            className="square bean"
            onClick={() => addBean(beanIndex)}
            key={beanIndex}
          >
            <img src={beansArray[beanIndex]} className="beanAsset" alt="Böna" />
          </div>
        ))}
      </div>
    </div>
  );
};

enum Operator {
  addition = "+",
  subtraction = "-",
  multiplication = "*",
}

enum Level {
  simple = "⭐",
  medium = "⭐⭐",
  hard = "⭐⭐⭐",
}

const OperatorToEmoji = {
  [Operator.addition]: "➕",
  [Operator.subtraction]: "➖",
  [Operator.multiplication]: "✖️",
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.round(min + Math.random() * (max - min));
};

const getLevelNumbers = (level: Level, operator: Operator): Array<number> => {
  if (level === Level.medium) {
    if (operator === Operator.multiplication) {
      return range(2).map(() => getRandomNumber(0, 9));
    }
    if (operator === Operator.subtraction) {
      return range(2)
        .map(() => getRandomNumber(0, 100))
        .sort((a, b) => b - a);
    }
    return range(2).map(() => getRandomNumber(0, 100));
  }
  if (level === Level.hard) {
    if (operator === Operator.multiplication) {
      return range(getRandomNumber(2, 3)).map(() => getRandomNumber(0, 20));
    }
    if (operator === Operator.subtraction) {
      return range(2).map(() => getRandomNumber(0, 100));
    }
    return range(getRandomNumber(2, 4)).map(() => getRandomNumber(0, 100));
  }

  // Simple
  if (operator === Operator.multiplication) {
    return range(2).map(() => getRandomNumber(1, 3));
  }
  if (operator === Operator.subtraction) {
    return range(2)
      .map(() => getRandomNumber(0, 5))
      .sort((a, b) => b - a);
  }
  return range(2).map(() => getRandomNumber(0, 10));
};

const calculate = (operator: Operator, numbersOrg: Array<number>) => {
  const numbers = [...numbersOrg];
  switch (operator) {
    case Operator.addition: {
      return numbers.reduce((acc, value) => value + acc, 0);
    }
    case Operator.subtraction: {
      const number = numbers.shift();
      if (typeof number === "undefined") return 0;
      return numbers.reduce((acc, value) => acc - value, number);
    }
    case Operator.multiplication: {
      return numbers.reduce((acc, value) => value * acc, 1);
    }
  }
};

// TODO:
// - [ ] Olika svårighetsgrad

function App() {
  const [currentLevel, setCurrentLevel] = useState<Level>(Level.simple);
  const [currentOperator, setOperator] = useState<Operator>(Operator.addition);

  const [canAnswer, setCanAnswer] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const answerInputRef = useRef<HTMLInputElement | null>(null);
  const [beansBoard, setBeansBoard] = useState<Array<number>>([]);
  const [numbers, setNumbers] = useState<Array<number>>(
    getLevelNumbers(currentLevel, currentOperator)
  );
  const [answer, setAnswer] = useState<string>("0");
  const testAnswer = () => {
    if (!canAnswer) {
      return;
    }
    const correctAnswer = calculate(currentOperator, numbers);
    if (parseInt(answer) === correctAnswer) {
      setMessage("🎊😺😸 BRAVO 😹😽🎊");
      setNumbers(getLevelNumbers(currentLevel, currentOperator));
      setBeansBoard([]);
      setAnswer("0");
      setCanAnswer(false);
      return;
    }
    if (beansBoard.length === correctAnswer) {
      setAnswer("0");
      setMessage("️🌟 Räkna om bönorna! ️🌟");
      return;
    }
    setAnswer("0");
    setMessage("😭 Försök igen! 😭");
  };

  useEffect(() => {
    setNumbers(getLevelNumbers(currentLevel, currentOperator));
  }, [currentLevel, currentOperator]);

  useEffect(() => {
    const focusInput = ({ key }: KeyboardEvent) => {
      if (key === "Enter") {
        testAnswer();
        return;
      }
      if (key === "Escape") {
        setAnswer("0");
        return;
      }
      if (isNaN(parseInt(key)) && key !== "-") {
        return;
      }
      if (message !== "") {
        setMessage("");
      }
      setCanAnswer(true);

      if (answer === "0") {
        answerInputRef.current?.select();
      } else {
        answerInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusInput);
    return () => document.removeEventListener("keydown", focusInput);
  });

  return (
    <div className="App">
      <header className="App-header">
        <h2>
          {Object.values(Operator).map((operator) => (
            <button
              key={operator}
              onClick={() => setOperator(operator)}
              className={`operatorButton ${
                currentOperator === operator ? "active" : ""
              }`}
            >
              {OperatorToEmoji[operator]}
            </button>
          ))}
        </h2>
        <h2>
          {Object.values(Level).map((level) => (
            <button
              key={level}
              onClick={() => setCurrentLevel(level)}
              className={`levelButton ${
                currentLevel === level ? "active" : ""
              }`}
            >
              {level}
            </button>
          ))}
        </h2>
        <h1>
          {numbers.join(` ${currentOperator} `)} =
          <input
            ref={answerInputRef}
            type="number"
            className="answerInput"
            value={answer}
            onChange={({ currentTarget }) => setAnswer(currentTarget.value)}
          />
          <button className="answerButton" onClick={testAnswer}>
            ✅
          </button>
        </h1>
      </header>

      <div className={`message ${message ? "visible" : "hidden"}`}>
        {message}
      </div>

      <GameBoard
        beansBoard={beansBoard}
        setBeansBoard={(beans) => {
          setBeansBoard(beans);
          setMessage("");
        }}
      />
    </div>
  );
}

export default App;
