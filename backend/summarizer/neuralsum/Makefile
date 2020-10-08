# yourname/
CONTAINER_PREFIX =
T5_VERSION = 1.0
BARTCNN_VERSION = 1.0
BARTXSUM_VERSION = 1.0
PEGASUSCNN_VERSION = 1.0
PEGASUSXSUM_VERSION = 1.0
LONGFORMER2ROBERTA_VERSION = 1.0

t5:
	docker build --build-arg NEURALSUM_MODEL=T5 -t $(CONTAINER_PREFIX)neuralsum-t5:$(T5_VERSION) .

bartcnn:
	docker build --build-arg NEURALSUM_MODEL=BART-CNN -t $(CONTAINER_PREFIX)neuralsum-bartcnn:$(BARTCNN_VERSION) .

bartxsum:
	docker build --build-arg NEURALSUM_MODEL=BART-XSum -t $(CONTAINER_PREFIX)neuralsum-bartxsum:$(BARTXSUM_VERSION) .

pegasuscnn:
	docker build --build-arg NEURALSUM_MODEL=Pegasus-CNN -t $(CONTAINER_PREFIX)neuralsum-pegasuscnn:$(PEGASUSCNN_VERSION) .

pegasusxsum:
	docker build --build-arg NEURALSUM_MODEL=Pegasus-XSum -t $(CONTAINER_PREFIX)neuralsum-pegasusxsum:$(PEGASUSXSUM_VERSION) .

longformer2roberta:
	docker build --build-arg NEURALSUM_MODEL=Longformer2Roberta -t $(CONTAINER_PREFIX)neuralsum-longformer2roberta:$(LONGFORMER2ROBERTA_VERSION) .
