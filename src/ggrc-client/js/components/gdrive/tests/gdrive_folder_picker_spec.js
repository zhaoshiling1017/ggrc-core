/*
 Copyright (C) 2018 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

describe('GGRC.Components.gDriveFolderPicker', function () {
  'use strict';

  let Component;
  let events;
  let viewModel;
  let folderId = 'folder id';

  beforeAll(function () {
    Component = GGRC.Components.get('gDriveFolderPicker');
    events = Component.prototype.events;
  });

  beforeEach(function () {
    viewModel = GGRC.Components.getViewModel('gDriveFolderPicker');
  });

  describe('events', function () {
    describe('"inserted" handler', function () {
      let method;
      let that;

      beforeEach(function () {
        that = {
          viewModel: viewModel,
          element: $('<div></div>'),
        };
        method = events.inserted.bind(that);
      });

      it('does nothing when folder is not attached', function () {
        viewModel.attr('instance', {
          folder: null,
        });
        viewModel.attr('readonly', true);

        spyOn(viewModel, 'setRevisionFolder');
        spyOn(viewModel, 'setCurrent');

        method();
        expect(viewModel.setRevisionFolder).not.toHaveBeenCalled();
        expect(viewModel.setCurrent).not.toHaveBeenCalled();
      });

      it('calls setRevisionFolder() for snapshot with attached folder',
      function () {
        viewModel.attr('instance', {
          folder: folderId,
        });
        viewModel.attr('readonly', true);
        spyOn(viewModel, 'setRevisionFolder');

        method();
        expect(viewModel.setRevisionFolder).toHaveBeenCalled();
      });

      it('calls setCurrent() when folder is attached', function () {
        viewModel.attr('instance', {
          folder: folderId,
        });
        viewModel.attr('readonly', false);
        spyOn(viewModel, 'setCurrent');

        method();
        expect(viewModel.setCurrent).toHaveBeenCalledWith(folderId);
      });
    });

    describe('"a[data-toggle=gdrive-remover] click" handler', function () {
      let method;
      let that;

      beforeEach(function () {
        viewModel.attr('instance', {
          folder: folderId,
        });

        that = {
          viewModel: viewModel,
          element: $('<div></div>'),
        };
        method = events['a[data-toggle=gdrive-remover] click'].bind(that);
      });

      it('unsets folder id for deferred instance', function () {
        viewModel.attr('deferred', true);

        spyOn(viewModel, 'unsetCurrent');

        method();
        expect(viewModel.instance.attr('folder')).toEqual(null);
        expect(viewModel.unsetCurrent).toHaveBeenCalled();
      });

      it('calls unlinkFolder() for existing instance', function () {
        viewModel.attr('deferred', false);

        spyOn(viewModel, 'unsetCurrent');
        spyOn(viewModel, 'unlinkFolder')
          .and.returnValue(can.Deferred().resolve());

        method();
        expect(viewModel.unlinkFolder).toHaveBeenCalled();
        expect(viewModel.unsetCurrent).toHaveBeenCalled();
      });
    });

    describe('a[data-toggle=gdrive-picker] keyup', function () {
      let method;
      let that;

      beforeEach(function () {
        that = {};
        method = events['a[data-toggle=gdrive-picker] keyup'].bind(that);
      });

      describe('if escape key was clicked', function () {
        let event;
        let element;

        beforeEach(function () {
          const ESCAPE_KEY_CODE = 27;
          event = {
            keyCode: ESCAPE_KEY_CODE,
            stopPropagation: jasmine.createSpy('stopPropagation'),
          };
          element = $('<div></div>');
        });

        it('calls stopPropagation for passed event', function () {
          method(element, event);
          expect(event.stopPropagation).toHaveBeenCalled();
        });

        it('unsets focus for element', function (done) {
          const blur = function () {
            done();
            element.off('blur', blur);
          };
          element.on('blur', blur);
          method(element, event);
        });
      });
    });

    describe('".entry-attachment picked" handler', function () {
      let method;
      let that;
      let element;
      let pickedFolders;

      beforeEach(function () {
        element = $('<div></div>').data('type', 'folders');
        viewModel.attr('instance', {
          folder: null,
        });
        pickedFolders = {
          files: [{
            mimeType: 'application/vnd.google-apps.folder',
            id: folderId,
          }],
        };

        that = {
          viewModel: viewModel,
        };
        method = events['.entry-attachment picked'].bind(that);
      });

      it('notifies when selected not a folder', function () {
        let data = {
          files: [{mimeType: 'not a folder mime type'}],
        };
        spyOn($.fn, 'trigger').and.callThrough();

        method(element, jasmine.any(Object), data);
        expect($.fn.trigger).toHaveBeenCalledWith('ajax:flash',
          {error: [jasmine.any(String)]});
      });

      it('set folder id for deferred instance', function () {
        viewModel.attr('deferred', true);

        spyOn(viewModel, 'setCurrent');
        spyOn(viewModel, 'linkFolder');

        method(element, jasmine.any(Object), pickedFolders);
        expect(viewModel.instance.attr('folder')).toEqual(folderId);
        expect(viewModel.setCurrent).toHaveBeenCalledWith(folderId);
        expect(viewModel.linkFolder).not.toHaveBeenCalled();
      });

      it('calls linkFolder() for existing instance', function () {
        viewModel.attr('deferred', false);

        spyOn(viewModel, 'setCurrent');
        spyOn(viewModel, 'linkFolder').and.returnValue(can.Deferred());

        method(element, jasmine.any(Object), pickedFolders);
        expect(viewModel.setCurrent).toHaveBeenCalledWith(folderId);
        expect(viewModel.linkFolder).toHaveBeenCalledWith(folderId);
      });
    });
  });
});
