import { useSelector } from "react-redux";

const ScoreCard = () => {
  const score = useSelector((state) => state.score);
  const computerScore = useSelector((state) => state.computerScore);
  const lettersLeftCount = useSelector((state) => state.lettersLeft.length);

  return (
    <div className="score-card">
      <div>Player Score: &nbsp; {score}</div>
    
      <div >Computer Score:&nbsp; {computerScore}</div>
      <div >Letters In Bag: &nbsp; {lettersLeftCount}</div>
    </div>
  );
};

export default ScoreCard;
