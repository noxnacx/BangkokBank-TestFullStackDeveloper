"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarksController = void 0;
const common_1 = require("@nestjs/common");
const bookmarks_service_1 = require("./bookmarks.service");
const create_bookmark_dto_1 = require("./dto/create-bookmark.dto");
const list_bookmarks_query_dto_1 = require("./dto/list-bookmarks-query.dto");
const patch_bookmark_dto_1 = require("./dto/patch-bookmark.dto");
const update_bookmark_dto_1 = require("./dto/update-bookmark.dto");
let BookmarksController = class BookmarksController {
    bookmarksService;
    constructor(bookmarksService) {
        this.bookmarksService = bookmarksService;
    }
    findAll(query, req) {
        return this.bookmarksService.findAll(req.user.ownerId, query.collectionId);
    }
    findOne(id, req) {
        return this.bookmarksService.findOne(id, req.user.ownerId);
    }
    create(dto, req) {
        return this.bookmarksService.create(dto, req.user.ownerId);
    }
    replace(id, dto, req) {
        return this.bookmarksService.replace(id, req.user.ownerId, dto);
    }
    update(id, dto, req) {
        return this.bookmarksService.update(id, req.user.ownerId, dto);
    }
    async remove(id, req) {
        await this.bookmarksService.remove(id, req.user.ownerId);
    }
};
exports.BookmarksController = BookmarksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_bookmarks_query_dto_1.ListBookmarksQueryDto, Object]),
    __metadata("design:returntype", void 0)
], BookmarksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BookmarksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bookmark_dto_1.CreateBookmarkDto, Object]),
    __metadata("design:returntype", void 0)
], BookmarksController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bookmark_dto_1.UpdateBookmarkDto, Object]),
    __metadata("design:returntype", void 0)
], BookmarksController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, patch_bookmark_dto_1.PatchBookmarkDto, Object]),
    __metadata("design:returntype", void 0)
], BookmarksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "remove", null);
exports.BookmarksController = BookmarksController = __decorate([
    (0, common_1.Controller)('bookmarks'),
    __metadata("design:paramtypes", [bookmarks_service_1.BookmarksService])
], BookmarksController);
//# sourceMappingURL=bookmarks.controller.js.map