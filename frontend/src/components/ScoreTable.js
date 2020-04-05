import React from "react";
import Table from "react-bootstrap/Table";


const ScoreRow = ({ name, score }) => (
  <tr>
    <td>{name}</td>
    <td>{score.toFixed(3)}</td>
  </tr>
);


const RougeTable = ({ rouge }) => {
  const subnames = ["f", "p", "r"];
  return (
    <Table>
      <thead>
        <tr>
          <th></th>
          {subnames.map((subname) => (
            <th>{subname}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(rouge)
          .sort()
          .map(([name, info]) => (
            <tr>
              <td>{name}</td>
              {subnames.map((subname) => (
                <td>{info[subname].toFixed(3)}</td>
              ))}
            </tr>
          ))}
      </tbody>
    </Table>
  );
};


const BleuTable = ({ bleu }) =>
  Object.entries(bleu)
    .sort()
    .map(([name, score]) => <ScoreRow key={name} name={name} score={score} />);



const ScoreTable = ({ scoreInfo }) => {
  const { cider, meteor, greedy_matching, bleu, rouge } = scoreInfo;

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {cider !== undefined && <ScoreRow name={"cider"} score={cider} />}
          {meteor !== undefined && <ScoreRow name={"meteor"} score={meteor} />}
          {greedy_matching !== undefined && (
            <ScoreRow name={"greedy_matching"} score={greedy_matching} />
          )}
          {bleu !== undefined && <BleuTable bleu={bleu} />}
        </tbody>
      </Table>
      {rouge !== undefined && <RougeTable rouge={rouge} />}
    </>
  );
};

export { ScoreTable };
