import { useSelector } from "react-redux";

const ScoreCard = () => {
  const score = useSelector((state) => state.score);
  return <div className="score-card">{score}</div>;
};

export default ScoreCard;
