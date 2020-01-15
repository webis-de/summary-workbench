import React, { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card'


function Settings() {
  const settings = [
    {
      metric: "Cider",
      is_set: false
    },
    {
      metric: "Bleu",
      is_set: true
    }
  ];
  const onClick = () => alert("Hallo");
  return (
    <Card variant="panel-default">
      <Card.Header>available metrics</Card.Header>
      <div class="panel-body">
        <div class="btn-group btn-group-justified">
          {settings.map(({ metric, is_set }) => (
            <a
              className={"btn " + is_set ? "btn-primary" : "btn-default"}
              value={metric}
              onClick={onClick}
            > {metric} </a>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default Settings;
