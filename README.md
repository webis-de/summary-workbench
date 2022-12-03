# Summary Workbench

Unifying the application and evaluation of text summarization models. [[Paper](https://arxiv.org/pdf/2210.09587.pdf)] [[Documentation](https://webis-de.github.io/summary-workbench/)] [[Live Demo](https://tldr.demo.webis.de)]
>Accepted at EMNLP 2022 (Demo track). :tada: :tada:

#### :loudspeaker: Updates (3-12-2022) 
1. Integrated 2 new models and their variants (6 in total): [BRIO](https://arxiv.org/abs/2203.16804) trained on news, [Schnitsum](https://github.com/sobamchan/schnitsum) trained on scholary documents.
2. Integrated [contrastive search](https://huggingface.co/blog/introducing-csearch) for more fluent summaries. User can now toggle between regular and contrasitve search for supported models. 
2. Improvements to the UI responsiveness on smaller devices.

## Summarize

### Create a Request

![Create a Request](docs/static/summarize_input.gif)

### Inspect the Results

![Inspect the Results](docs/static/summarize_usage.gif)

# Evaluate

### Create a Request

![Create a Request](docs/static/evaluation_input.gif)

### Inspect the Results

#### Scores

![Scores](docs/static/evaluation_scores.gif)

#### Visualize Text Examples

![Visualize Text Examples](docs/static/evaluation_visualization.gif)

#### Plot Scores against each other

![Plot Scores against each other](docs/static/evaluation_plotter.gif)
