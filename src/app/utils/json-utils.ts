export const jsonUtils = {
    menus: [
        {
            name: 'Inicio',
            icon: 'fa-home',
            url: '/dashboard',
            idMenu: 1,
            privileges: 0,
            isLateralMenu: true,
            permissions: '',
            submenus: []
        },
        {
            name: 'Operaciones',
            icon: 'fa-microchip',
            url: '',
            idMenu: 2,
            privileges: 0,
            isLateralMenu: true,
            permissions: '',
            submenus: [
                {
                    name: 'Clientes',
                    icon: 'fa-id-badge',
                    idMenu: 2.1,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/dashboard'
                },
                {
                    name: 'Equipos',
                    icon: 'fa-cogs',
                    idMenu: 2.2,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/machines'
                },
                {
                    name: 'Metas',
                    icon: 'fa-truck-loading',
                    idMenu: 2.3,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/dashboard'
                },
                {
                    name: 'Mapas',
                    icon: 'fa-map-marker-alt',
                    idMenu: 2.4,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/dashboard'
                },
            ]
        },
        {
            name: 'Ignite',
            icon: 'fa-fire',
            url: '',
            idMenu: 3,
            privileges: 0,
            isLateralMenu: true,
            permissions: '',
            submenus: [
                {
                    name: 'GCC',
                    icon: 'fa-home',
                    idMenu: 3.1,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/dashboard'
                },
            ]
        },
        /*{
            name: 'Recursos Humanos',
            icon: 'fa-users',
            url: '',
            idMenu: 4,
            privileges: 0,
            isLateralMenu: true,
            permissions: '',
            submenus: [
                {
                    name: 'Conductores',
                    icon: 'fa-users',
                    idMenu: 4.1,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/dashboard'
                },
                {
                    name: 'Recursos Humanos',
                    icon: 'fa-align-justify',
                    idMenu: 4.2,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/rh'
                },
            ]
        },*/
        {
            name: 'Configuración',
            icon: 'fa-cogs',
            url: '',
            idMenu: 5,
            privileges: 0,
            isLateralMenu: true,
            permissions: '',
            submenus: [
                {
                    name: 'Configuración',
                    icon: 'fa-cogs',
                    idMenu: 5.1,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/dashboard'
                },
                {
                    name: 'Usuarios y Privilegios',
                    icon: 'fa-edit',
                    idMenu: 5.2,
                    privileges: 0,
                    isLateralMenu: true,
                    permissions: '',
                    url: '/privileges'
                },
                {
                    name: 'Editar Usuarios y Privilegios',
                    icon: 'fa-edit',
                    idMenu: 5.3,
                    privileges: 0,
                    isLateralMenu: false,
                    permissions: '',
                    url: '/privileges-detail'
                },
            ]
        },
    ]
};