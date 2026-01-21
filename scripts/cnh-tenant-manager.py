#!/usr/bin/env python3
# CNH Tenant Manager - Gerenciador de domínios para Telas CNH (multihab)
# Usa tenants.json (novo sistema multi-tenant)
import sys, json, os

TENANTS_FILE = '/var/www/multihab/public/tenants.json'

def load_tenants():
    if not os.path.exists(TENANTS_FILE):
        return {'tenants': {}}, None
    with open(TENANTS_FILE, 'r') as f:
        return json.load(f), None

def save_tenants(data):
    with open(TENANTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def add_domain(domain, layout='a', ads_id='', ads_label=''):
    data, err = load_tenants()
    if err:
        return {'success': False, 'error': err}
    
    if domain in data['tenants']:
        return {'success': True, 'action': 'exists', 'domain': domain}
    
    data['tenants'][domain] = {
        'layout': layout,
        'googleAdsId': ads_id,
        'googleAdsConversionLabel': ads_label
    }
    save_tenants(data)
    return {'success': True, 'action': 'added', 'domain': domain}

def update_domain(domain, field, value):
    data, err = load_tenants()
    if err:
        return {'success': False, 'error': err}
    
    if domain not in data['tenants']:
        return {'success': False, 'error': 'domain not found'}
    
    # Mapear campos amigáveis
    field_map = {
        'layout': 'layout',
        'ads_id': 'googleAdsId',
        'ads-id': 'googleAdsId',
        'googleAdsId': 'googleAdsId',
        'conversion': 'googleAdsConversionLabel',
        'ads_label': 'googleAdsConversionLabel',
        'ads-label': 'googleAdsConversionLabel',
        'googleAdsConversionLabel': 'googleAdsConversionLabel'
    }
    
    actual_field = field_map.get(field, field)
    data['tenants'][domain][actual_field] = value
    save_tenants(data)
    return {'success': True, 'domain': domain, 'field': actual_field, 'value': value}

def remove_domain(domain):
    data, err = load_tenants()
    if err:
        return {'success': False, 'error': err}
    
    if domain not in data['tenants']:
        return {'success': False, 'error': 'domain not found'}
    
    del data['tenants'][domain]
    save_tenants(data)
    return {'success': True, 'action': 'removed', 'domain': domain}

def get_domain(domain):
    data, err = load_tenants()
    if err:
        return {'success': False, 'error': err}
    
    if domain not in data['tenants']:
        return {'success': False, 'error': 'domain not found'}
    
    return {'success': True, 'domain': domain, 'config': data['tenants'][domain]}

def list_domains():
    data, err = load_tenants()
    if err:
        return {'success': False, 'error': err}
    
    domains = []
    for domain, config in data['tenants'].items():
        domains.append({
            'domain': domain,
            'layout': config.get('layout', 'a'),
            'googleAdsId': config.get('googleAdsId', ''),
            'googleAdsConversionLabel': config.get('googleAdsConversionLabel', '')
        })
    return {'success': True, 'domains': domains, 'count': len(domains)}

def print_help():
    print(json.dumps({
        'usage': {
            'add': 'add <domain> [layout] [ads_id] [ads_label]',
            'update': 'update <domain> <field> <value>',
            'remove': 'remove <domain>',
            'get': 'get <domain>',
            'list': 'list',
            'fields': ['layout', 'ads_id', 'conversion']
        }
    }))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    try:
        if cmd == 'add':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'domain required'}))
                sys.exit(1)
            r = add_domain(
                sys.argv[2],
                sys.argv[3] if len(sys.argv) > 3 else 'a',
                sys.argv[4] if len(sys.argv) > 4 else '',
                sys.argv[5] if len(sys.argv) > 5 else ''
            )
        elif cmd == 'update':
            if len(sys.argv) < 5:
                print(json.dumps({'error': 'usage: update <domain> <field> <value>'}))
                sys.exit(1)
            r = update_domain(sys.argv[2], sys.argv[3], sys.argv[4])
        elif cmd == 'remove':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'domain required'}))
                sys.exit(1)
            r = remove_domain(sys.argv[2])
        elif cmd == 'get':
            if len(sys.argv) < 3:
                print(json.dumps({'error': 'domain required'}))
                sys.exit(1)
            r = get_domain(sys.argv[2])
        elif cmd == 'list':
            r = list_domains()
        elif cmd == 'help':
            print_help()
            sys.exit(0)
        else:
            r = {'error': 'invalid command', 'valid': ['add', 'update', 'remove', 'get', 'list']}
        
        print(json.dumps(r))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
