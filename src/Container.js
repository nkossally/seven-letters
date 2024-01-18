import update from 'immutability-helper'
import { useCallback, useState } from 'react'
import { Card } from './Card.js'
const style = {
  width: 400,
  display: "flex",
 "flex-direction": "row",
}
export const Container = () => {
  {
    const [cards, setCards] = useState([
      {
        id: 1,
        text: 'A',
      },
      {
        id: 2,
        text: 'E',
      },
      {
        id: 3,
        text: 'I',
      },
      {
        id: 4,
        text: 'T',
      },
      {
        id: 5,
        text: 'S',
      },
      {
        id: 6,
        text: 'j',
      },
      {
        id: 7,
        text: 'P',
      },
    ])
    const moveCard = useCallback((dragIndex, hoverIndex) => {
      setCards((prevCards) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        }),
      )
    }, [])
    const renderCard = useCallback((card, index) => {
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
        />
      )
    }, [])
    return (
      <div className="board">
        <div style={style}>{cards.slice(0, 5).map((card, i) => renderCard(card, i))}</div>
        <div className="blarg"/>
        <div style={style}>{cards.slice(5).map((card, i) => renderCard(card, i))}</div>
      </div>
    )
  }
}
