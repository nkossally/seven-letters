import { useSelector } from "react-redux";

const ScoreCard = () => {
  const score = useSelector((state) => state.score);
  const computerScore = useSelector((state) => state.computerScore);
  console.log(score, computerScore)

  return (
    <div className="score-card">
      <div>P{score}</div>
      <p/>
      <div >C{computerScore}</div>
    </div>
  );
};

export default ScoreCard;
