import { db } from '$lib/server/db';
import * as sveltekit from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actions, load } from '../+page.server';

// Mock modules and dependencies
vi.mock('$env/static/private', () => ({
  DEBUG: 'true'
}));

vi.mock('$lib/server/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ Id: 123 }])
  }
}));

vi.mock('$lib/server/db/schema', () => ({
  Trees: {}
}));

vi.mock('$lib/utility/typicals', () => ({
  typical_development_notice: vi.fn()
}));

vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    redirect: vi.fn(),
    fail: vi.fn().mockImplementation((code, data) => {
      return { status: code, data };
    }),
    isRedirect: vi.fn(),
    isActionFailure: vi.fn()
  };
});

vi.mock('sveltekit-superforms', () => ({
  superValidate: vi.fn().mockResolvedValue({
    valid: true,
    data: {
      tree_name: 'Oak Tree',
      tree_image: 'https://example.com/tree.jpg',
      tree_lat: 40.7128,
      tree_lng: -74.0060,
      tree_height: 5,
      tree_age: 10,
      tree_species: 'Oak'
    }
  }),
  setError: vi.fn()
}));

describe('Add/Manage Tree page server', () => {
  let mockEvent: any;

  beforeEach(() => {
    mockEvent = {
      locals: {
        user: {
          Id: 1
        }
      },
      request: {}
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('load function', () => {
    it('should return form data', async () => {
      const result = await load(mockEvent);
      expect(result).toBeDefined();
    });
  });

  describe('actions.default', () => {
    it('should fail if user is not logged in', async () => {
      mockEvent.locals.user = null;
      
      const result = await actions.default(mockEvent);
      expect(sveltekit.fail).toHaveBeenCalledWith(401, expect.anything());
    });

    it('should fail validation if form is invalid', async () => {
      const { superValidate } = await import('sveltekit-superforms');
      (superValidate as any).mockResolvedValueOnce({
        valid: false,
        data: {}
      });

      const result = await actions.default(mockEvent);
      expect(sveltekit.fail).toHaveBeenCalledWith(400, expect.anything());
    });

    it('should create new tree and redirect on success', async () => {
      await actions.default(mockEvent);
      
      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
        TreeName: 'Oak Tree',
        Image: 'https://example.com/tree.jpg',
        Lat: 40.7128,
        Lng: -74.0060,
        Height: 5,
        Health: 'EXCELLENT',
        PlantedBy: 1,
        Age: 10,
        TreeSpecies: 1
      }));
      
      expect(sveltekit.redirect).toHaveBeenCalledWith(303, '/explore?tree_id=123');
    });

    it('should handle errors during tree creation', async () => {
      // Mock database error
      const mockDb = db as any;
      mockDb.returning.mockRejectedValueOnce(new Error('Database error'));
      
      await actions.default(mockEvent);
      
      expect(sveltekit.fail).toHaveBeenCalledWith(500, expect.anything());
    });
  });
});