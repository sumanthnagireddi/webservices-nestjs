import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { of, throwError } from 'rxjs';
import { ContentVersionDocument } from '../content/content.schemas';
import { AtlassianContentDocument } from './atlassian-content.schema';
import { AtlassianFolderDocument } from './atlassian-folder.schema';
import {
  ConfluenceFolderDocument,
  ConfluencePageDocument,
} from './atlassian-sync.schemas';
import { AtlassianServiceV2 } from './atlassianV2.service';

const remotePage = {
  id: '144965643',
  title: 'Live Confluence page',
  type: 'page',
  status: 'current',
  space: { key: 'ENG' },
  version: {
    number: 7,
    when: '2026-11-23T12:00:00.000Z',
    by: { displayName: 'Page author' },
  },
  ancestors: [{ id: '100' }, { id: '200', title: 'Parent' }],
  body: { storage: { value: '<p>Live body</p>' } },
};

function findQuery<T>(value: T) {
  return { lean: () => ({ exec: jest.fn().mockResolvedValue(value) }) };
}

describe('AtlassianServiceV2 getPageContent', () => {
  const config = {
    get: jest.fn((key: string) =>
      key === 'ATLASSIAN_SITE_URL'
        ? 'https://example.atlassian.net'
        : undefined,
    ),
  };
  const http = { get: jest.fn() };
  const atlassianContentModel = {
    findOne: jest.fn().mockReturnValue(findQuery(null)),
  };
  const confluencePageModel = {
    findOne: jest.fn().mockReturnValue(findQuery(null)),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
  };

  let service: AtlassianServiceV2;

  beforeEach(() => {
    jest.clearAllMocks();
    atlassianContentModel.findOne.mockReturnValue(findQuery(null));
    confluencePageModel.findOne.mockReturnValue(findQuery(null));
    confluencePageModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    service = new AtlassianServiceV2(
      http as unknown as HttpService,
      config as unknown as ConfigService,
      atlassianContentModel as unknown as Model<AtlassianContentDocument>,
      {} as Model<AtlassianFolderDocument>,
      {} as Model<ConfluenceFolderDocument>,
      confluencePageModel as unknown as Model<ConfluencePageDocument>,
      {} as Model<ContentVersionDocument>,
    );
  });

  it('fetches and caches a page from Confluence when it is not synced', async () => {
    http.get.mockReturnValue(of({ data: remotePage }));

    await expect(service.getPageContent('144965643')).resolves.toEqual({
      id: '144965643',
      title: 'Live Confluence page',
      spaceKey: 'ENG',
      parentId: '200',
      body: '<p>Live body</p>',
      version: 7,
      lastModifiedBy: 'Page author',
      lastModifiedAt: '2026-11-23T12:00:00.000Z',
      url: 'https://example.atlassian.net/wiki/spaces/ENG/pages/144965643',
    });

    const request = http.get.mock.calls[0] as unknown as [
      string,
      { headers: Record<string, string>; params: { expand: string } },
    ];
    expect(request[0]).toBe(
      'https://example.atlassian.net/wiki/rest/api/content/144965643',
    );
    expect(request[1].headers.Authorization).toMatch(/^Basic /);
    expect(request[1].params).toEqual({
      expand: 'body.storage,version,space,ancestors',
    });
    expect(confluencePageModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    const cacheUpdate = confluencePageModel.findOneAndUpdate.mock
      .calls[0] as unknown as [
      { confluenceId: string },
      { $set: Record<string, unknown> },
      { upsert: boolean; new: boolean },
    ];
    expect(cacheUpdate[0]).toEqual({ confluenceId: '144965643' });
    expect(cacheUpdate[1].$set).toMatchObject({
      confluenceId: '144965643',
      title: 'Live Confluence page',
      spaceKey: 'ENG',
      status: 'current',
      parentId: '200',
      body: '<p>Live body</p>',
      version: 7,
      versionBy: 'Page author',
    });
    expect(cacheUpdate[2]).toEqual({ upsert: true, new: true });
  });

  it('fetches live content when a synced page is only an empty tree stub', async () => {
    atlassianContentModel.findOne.mockReturnValue(findQuery(null));
    confluencePageModel.findOne.mockReturnValue(
      findQuery({
        confluenceId: '144965643',
        title: 'Synced tree stub',
        spaceKey: 'ENG',
        parentId: '200',
        body: '',
        version: 0,
      }),
    );
    http.get.mockReturnValue(of({ data: remotePage }));

    await expect(service.getPageContent('144965643')).resolves.toMatchObject({
      id: '144965643',
      title: 'Live Confluence page',
      body: '<p>Live body</p>',
      version: 7,
    });
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(confluencePageModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('continues to the synced-page lookup when the legacy page body is empty', async () => {
    atlassianContentModel.findOne.mockReturnValue(
      findQuery({
        atlassianId: '144965643',
        title: 'Legacy empty page',
        spaceKey: 'ENG',
        body: '  ',
      }),
    );
    confluencePageModel.findOne.mockReturnValue(
      findQuery({
        confluenceId: '144965643',
        title: 'Synced page',
        spaceKey: 'ENG',
        body: '<p>Synced body</p>',
      }),
    );

    await expect(service.getPageContent('144965643')).resolves.toMatchObject({
      body: '<p>Synced body</p>',
    });
    expect(http.get).not.toHaveBeenCalled();
  });

  it('returns a not-found response when Confluence confirms the page does not exist', async () => {
    http.get.mockReturnValue(
      throwError(() =>
        Object.assign(new Error('Not found'), {
          isAxiosError: true,
          response: { status: 404 },
        }),
      ),
    );

    await expect(service.getPageContent('144965643')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(confluencePageModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
