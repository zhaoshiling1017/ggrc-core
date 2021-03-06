/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import '../object-list-item/document-object-list-item';
import template from './editable-document-object-list-item.mustache';

(function (can, GGRC) {
  'use strict';

  let tag = 'editable-document-object-list-item';

  GGRC.Components('editableDocumentObjectListItem', {
    tag: tag,
    template: template,
    viewModel: {
      document: {},
    },
  });
})(window.can, window.GGRC);
