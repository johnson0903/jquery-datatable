$(document).ready(function () {
  // data table indibvidual column filter extension
  // $.fn.dataTable.ext.search.push(
  //   function( settings, searchData, index, rowData, counter ) {
  //     var positions = $('input:checkbox[name="pos"]:checked').map(function() {
  //       return this.value;
  //     }).get();

  //     if (positions.length === 0) {
  //       return true;
  //     }

  //     if (positions.indexOf(searchData[1]) !== -1) {
  //       return true;
  //     }

  //     return false;
  //   }
  // );

  $('input:checkbox[name="pos"]').on("change", function () {
    table.draw();
  });

  // checkbox dropdown
  var CheckboxDropdown = function (el) {
    var _this = this;
    this.isOpen = false;
    this.areAllChecked = false;
    this.checkArray = [];
    this.$el = $(el);
    this.$label = this.$el.find(".dropdown-label");
    this.$checkAll = this.$el.find('[data-toggle="check-all"]').first();
    this.$inputs = this.$el.find('[type="checkbox"]');

    this.onCheckAll();

    this.$label.on("click", function (e) {
      e.preventDefault();
      _this.toggleOpen();
    });

    this.$checkAll.on("click", function (e) {
      e.preventDefault();
      _this.onCheckAll();
    });

    this.$inputs.on("change", function (e) {
      _this.onCheckBox($(this));
    });
  };

  CheckboxDropdown.prototype.onCheckBox = function ($checkbox) {
    this.updateTableColumnVisible($checkbox);
    //this.updateStatus();
  };

  CheckboxDropdown.prototype.updateStatus = function () {
    var checked = this.$el.find(":checked");

    this.areAllChecked = false;
    this.$checkAll.html("Check All");

    if (checked.length <= 0) {
      this.$label.html("Select Options");
    } else if (checked.length === 1) {
      this.$label.html(checked.parent("label").text());
    } else if (checked.length === this.$inputs.length) {
      this.$label.html("All Selected");
      this.areAllChecked = true;
      this.$checkAll.html("Uncheck All");
    } else {
      this.$label.html(checked.length + " Selected");
    }
  };

  CheckboxDropdown.prototype.onCheckAll = function (checkAll) {
    if (!this.areAllChecked || checkAll) {
      this.areAllChecked = true;
      this.$checkAll.html("Uncheck All");
      this.$inputs.prop("checked", true);
    } else {
      this.areAllChecked = false;
      this.$checkAll.html("Check All");
      this.$inputs.prop("checked", false);
    }

    //this.updateStatus();
  };

  CheckboxDropdown.prototype.toggleOpen = function (forceOpen) {
    var _this = this;

    if (!this.isOpen || forceOpen) {
      this.isOpen = true;
      this.$el.addClass("on");
      $(document).on("click", function (e) {
        if (!$(e.target).closest("[data-control]").length) {
          _this.toggleOpen();
        }
      });
    } else {
      this.isOpen = false;
      this.$el.removeClass("on");
      $(document).off("click");
    }
  };

  CheckboxDropdown.prototype.updateTableColumnVisible = function ($checkbox) {
    const colspan = $checkbox.data("colspan");
    const index = $checkbox.val();

    if (colspan > 1) {
      let indexArr = [];
      for (let i = 0; i < colspan; i++) {
        indexArr.push(i + parseInt(index));
      }
      table.columns(indexArr).visible($checkbox.is(":checked"));
      return;
    }

    const column = table.column(index);
    column.visible($checkbox.is(":checked"));
  };
  var table;
  var app = new Vue({
    el: "#app",
    data: {
      tableJsonData: null,
      tableHeader: null,
      tableData: null,
      tableDataArray: [],
    },
    created() {
      const self = this;
      $.getJSON("./tess.json", function (data) {
        self.tableJsonData = data;
        self.tableHeader = data.filter((item) => item.IsTitle);
        self.tableData = data.filter((item) => !item.IsTitle);
        self.formatTableBodyData();
        self.$nextTick(function () {
          const $searchContainer = $(".custom-search-container");
          const $customSearchInput = $("#custom-search");

          table = $("#example").DataTable({
            fixedHeader: true,
            // pageLength: 25,
            dom: "lrtip",
            // bLengthChange: false,
            "bInfo" : false,
            ordering: false,
            columnDefs: [
              {
                targets: "_all",
                className: "dt-center",
              },
            ],
            "language": {
              "paginate": {
                "previous": "&lt;",
                "next": "&gt;"
              }
            }
          });

          var checkboxesDropdowns = document.querySelectorAll(
            '[data-control="checkbox-dropdown"]'
          );
          for (
            var i = 0, length = checkboxesDropdowns.length;
            i < length;
            i++
          ) {
            new CheckboxDropdown(checkboxesDropdowns[i]);
          }
          $customSearchInput.focus(function () {
            $searchContainer.addClass("active");
          });
          $customSearchInput.focusout(function () {
            if (!$customSearchInput.val()) {
              $searchContainer.removeClass("active");
            }
          });
          $customSearchInput.on("input", function () {
            const val = $(this).val();
            if (val) {
              $searchContainer.addClass("active");
            } else {
              $searchContainer.removeClass("active");
            }
            table.search(val).draw();
          });
        });
      });
    },
    methods: {
      getColCount: function () {
        thCount = this.tableHeader.length;
        this.tableHeader.forEach((item) => {
          if (item.ColSpan > 1) {
            thCount -= 1;
          }
        });
        return thCount;
      },
      formatTableBodyData: function () {
        let sort = 0;
        const colCount = this.getColCount();
        for (let i = 0; i < this.tableData.length; i += colCount) {
          let arowData = [];
          for (let j = 0; j < colCount; j++) {
            let aData = this.tableData[sort];
            arowData.push(aData);
            sort += 1;
          }
          this.tableDataArray.push(arowData);
        }
      },
    },
  });
});
