var Pagination = function () {
    this.itemsPerPage = 1;
    this.currentPage = 1;
    this.pagingControlsContainer = '#pagingControls';
    this.pagingContainerPath = '#content';
    this.errorMessageContainer = '#goto-error-message';

    this.numPages = function () {
        var numPages = 0;
        if (this.items != null && this.itemsPerPage != null) {
            numPages = Math.ceil(this.items.length / this.itemsPerPage);
        }
        return numPages;
    };

    this.showPage = function (page) {
        this.currentPage = page;
        var html = "";
        for (var i = (page - 1) * this.itemsPerPage; i < ((page - 1) * this.itemsPerPage) + this
        .itemsPerPage; i++) {
        if (i < this.items.length) {
            var elem = this.items.get(i);
            html += "<" + elem.tagName + ">" + elem.innerHTML + "</" + elem.tagName + ">";
            
        }
    }
    $(this.pagingContainerPath).html(html);
         
    }

};

