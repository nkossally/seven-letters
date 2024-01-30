import { useSelector } from "react-redux";

const ScoreCard = () => {
  const score = useSelector((state) => state.score);
  const computerScore = useSelector((state) => state.computerScore);
  console.log(score, computerScore)

  return (
    <div className="score-card">
      <div>Player Score:<p/>{score}</div>
      <p/>
      <div >Computer Score: <p/>{computerScore}</div>
    </div>
  );
};

export default ScoreCard;
