# yourname/
CONTAINER_PREFIX ?=
BERT_VERSION = 1.0
BLEURT_VERSION = 1.0
GREEDY_MATCHING_VERSION = 1.0
METEOR_VERSION = 1.0
MOVERSCORE_VERSION = 1.0
SENTENCE_TRANSFORMERS_VERSION = 1.0
SIMPLE_METRICS_VERSION = 1.0

ifndef CONTAINER_PREFIX
  $(error CONTAINER_PREFIX is not set)
endif

build_bert:
	docker build -t $(CONTAINER_PREFIX)bert:$(BERT_VERSION) bert/

push_bert:
	docker push $(CONTAINER_PREFIX)bert:$(BERT_VERSION)

build_bleurt:
	docker build -t $(CONTAINER_PREFIX)bleurt:$(BLEURT_VERSION) bleurt/

push_bleurt:
	docker push $(CONTAINER_PREFIX)bleurt:$(BLEURT_VERSION)

build_greedy_matching:
	docker build -t $(CONTAINER_PREFIX)greedy_matching:$(GREEDY_MATCHING_VERSION) greedy_matching/

push_greedy_matching:
	docker push $(CONTAINER_PREFIX)greedy_matching:$(GREEDY_MATCHING_VERSION)

build_meteor:
	docker build -t $(CONTAINER_PREFIX)meteor:$(METEOR_VERSION) meteor/

push_meteor:
	docker push $(CONTAINER_PREFIX)meteor:$(METEOR_VERSION)

build_moverscore:
	docker build -t $(CONTAINER_PREFIX)moverscore:$(MOVERSCORE_VERSION) moverscore/

push_moverscore:
	docker push $(CONTAINER_PREFIX)moverscore:$(MOVERSCORE_VERSION)

build_sentence_transformers:
	docker build -t $(CONTAINER_PREFIX)sentence_transformers:$(SENTENCE_TRANSFORMERS_VERSION) sentence_transformers/

push_sentence_transformers:
	docker push $(CONTAINER_PREFIX)sentence_transformers:$(SENTENCE_TRANSFORMERS_VERSION)

build_simple_metrics:
	docker build -t $(CONTAINER_PREFIX)simple_metrics:$(SIMPLE_METRICS_VERSION) simple/

push_simple_metrics:
	docker push $(CONTAINER_PREFIX)simple_metrics:$(SIMPLE_METRICS_VERSION)

build_all: build_bert build_simple_metrics build_bleurt build_greedy_matching build_meteor build_moverscore build_sentence_transformers
push_all: push_bert push_simple_metrics push_bleurt push_greedy_matching push_meteor push_moverscore push_sentence_transformers

all: build_all push_all
