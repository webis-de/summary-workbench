# yourname/
CONTAINER_PREFIX =
T5_VERSION = 1.0
BARTCNN_VERSION = 1.0
BARTXSUM_VERSION = 1.0
PEGASUSCNN_VERSION = 1.0
PEGASUSXSUM_VERSION = 1.0
LONGFORMER2ROBERTA_VERSION = 1.0

build_t5:
	docker build --build-arg NEURALSUM_MODEL=T5 -t $(CONTAINER_PREFIX)neuralsum-t5:$(T5_VERSION) .

push_t5:
	docker push $(CONTAINER_PREFIX)neuralsum-t5:$(T5_VERSION)

build_bartcnn:
	docker build --build-arg NEURALSUM_MODEL=BART-CNN -t $(CONTAINER_PREFIX)neuralsum-bartcnn:$(BARTCNN_VERSION) .

push_bartcnn:
	docker push $(CONTAINER_PREFIX)neuralsum-bartcnn:$(BARTCNN_VERSION)

build_bartxsum:
	docker build --build-arg NEURALSUM_MODEL=BART-XSum -t $(CONTAINER_PREFIX)neuralsum-bartxsum:$(BARTXSUM_VERSION) .

push_bartxsum:
	docker push $(CONTAINER_PREFIX)neuralsum-bartxsum:$(BARTXSUM_VERSION)

build_pegasuscnn:
	docker build --build-arg NEURALSUM_MODEL=Pegasus-CNN -t $(CONTAINER_PREFIX)neuralsum-pegasuscnn:$(PEGASUSCNN_VERSION) .

push_pegasuscnn:
	docker push $(CONTAINER_PREFIX)neuralsum-pegasuscnn:$(PEGASUSCNN_VERSION)

build_pegasusxsum:
	docker build --build-arg NEURALSUM_MODEL=Pegasus-XSum -t $(CONTAINER_PREFIX)neuralsum-pegasusxsum:$(PEGASUSXSUM_VERSION) .

push_pegasusxsum:
	docker push $(CONTAINER_PREFIX)neuralsum-pegasusxsum:$(PEGASUSXSUM_VERSION)

build_longformer2roberta:
	docker build --build-arg NEURALSUM_MODEL=Longformer2Roberta -t $(CONTAINER_PREFIX)neuralsum-longformer2roberta:$(LONGFORMER2ROBERTA_VERSION) .

push_longformer2roberta:
	docker push $(CONTAINER_PREFIX)neuralsum-longformer2roberta:$(LONGFORMER2ROBERTA_VERSION)

build_all: build_t5 build_bartcnn build_bartxsum build_pegasuscnn build_pegasusxsum build_longformer2roberta
push_all: push_t5 push_bartcnn push_bartxsum push_pegasuscnn push_pegasusxsum push_longformer2roberta

